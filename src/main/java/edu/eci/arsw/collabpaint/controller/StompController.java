package edu.eci.arsw.collabpaint.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import edu.eci.arsw.collabpaint.model.Point;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

import org.springframework.lang.NonNull;

@Controller
public class StompController {

    private static final Logger logger = Logger.getLogger(StompController.class.getName());
    private final Map<String, String> userSessions = new ConcurrentHashMap<>();

    @MessageMapping("/point")
    @SendTo("/topic/draw")
    public Point handlePoint(Point point, SimpMessageHeaderAccessor headerAccessor, Principal principal) {
        String sessionId = getSessionId(headerAccessor);
        String username = principal != null ? principal.getName() : "anonymous";
        
        logger.info(String.format("Point received from %s (session: %s): %s", 
            username, sessionId, point));
            
        return point;
    }

    @MessageMapping("/register")
    @SendToUser("/queue/registered")
    public String registerUser(SimpMessageHeaderAccessor headerAccessor, Principal principal) {
        String sessionId = getSessionId(headerAccessor);
        String username = principal != null ? principal.getName() : "user-" + UUID.randomUUID().toString().substring(0, 8);
        
        userSessions.put(sessionId, username);
        logger.info(String.format("User registered - Session: %s, Username: %s", sessionId, username));
        
        return String.format("{\"status\":\"success\",\"username\":\"%s\"}", username);
    }

private String getSessionId(@NonNull SimpMessageHeaderAccessor headerAccessor) {
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes == null) {
            return "no-session-attributes";
        }
        
        Object sessionId = sessionAttributes.get("sessionId");
        return sessionId != null ? sessionId.toString() : "no-session-id";
    }
}