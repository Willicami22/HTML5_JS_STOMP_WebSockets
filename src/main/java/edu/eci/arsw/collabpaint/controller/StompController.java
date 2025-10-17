package edu.eci.arsw.collabpaint.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import edu.eci.arsw.collabpaint.model.Point;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;

@Controller
public class StompController {

    private static final Logger logger = Logger.getLogger(StompController.class.getName());
    private final Map<String, String> userSessions = new ConcurrentHashMap<>();
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/point")
    public void handlePoint(@Payload Point point, SimpMessageHeaderAccessor headerAccessor, Principal principal) {
        String sessionId = getSessionId(headerAccessor);
        String username = principal != null ? principal.getName() : "anonymous";
        
        if (point.getDrawingId() == null || point.getDrawingId().trim().isEmpty()) {
            logger.warning("Received point without drawing ID from " + username + " (session: " + sessionId + ")");
            return;
        }
        
        logger.info(String.format("Point received from %s (session: %s) for drawing %s: %s", 
            username, sessionId, point.getDrawingId(), point));
        
        // Send the point to all subscribers of this drawing
        String destination = "/topic/draw." + point.getDrawingId();
        messagingTemplate.convertAndSend(destination, point);
    }

    @MessageMapping("/register")
    public void registerUser(SimpMessageHeaderAccessor headerAccessor, Principal principal) {
        String sessionId = getSessionId(headerAccessor);
        String username = principal != null ? principal.getName() : "user-" + UUID.randomUUID().toString().substring(0, 8);
        
        userSessions.put(sessionId, username);
        logger.info(String.format("User registered - Session: %s, Username: %s", sessionId, username));
        
        // Send registration confirmation to the user's private queue
        String response = String.format("{\"status\":\"success\",\"username\":\"%s\"}", username);
        messagingTemplate.convertAndSendToUser(sessionId, "/queue/registered", response);
    }

    /**
     * Gets the session ID from the message header
     */
    private String getSessionId(@NonNull SimpMessageHeaderAccessor headerAccessor) {
        if (headerAccessor.getSessionAttributes() == null) {
            return "no-session-attributes";
        }
        
        // Get the WebSocket session ID
        String sessionId = headerAccessor.getSessionId();
        return sessionId != null ? sessionId : "no-session-id";
    }
}