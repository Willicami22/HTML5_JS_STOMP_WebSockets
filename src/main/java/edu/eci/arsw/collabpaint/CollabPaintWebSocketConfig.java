package edu.eci.arsw.collabpaint;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
@EnableWebSocketMessageBroker
public class CollabPaintWebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        // Enable a simple in-memory broker for topics
        config.enableSimpleBroker("/topic");
        
        // Set prefix for application destination (client to server)
        config.setApplicationDestinationPrefixes("/app");
        
        // Set prefix for user destination (private messages)
        config.setUserDestinationPrefix("/user");
        
        // Set the message size limits (optional)
        config.setUserRegistryOrder(0);
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // Configure WebSocket endpoint with SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Allow all origins for development
                .withSockJS()
                .setClientLibraryUrl("https://cdn.jsdelivr.net/npm/sockjs-client@1.6.1/dist/sockjs.min.js")
                .setSessionCookieNeeded(false)
                .setStreamBytesLimit(512 * 1024) // 512KB
                .setHttpMessageCacheSize(1000)
                .setDisconnectDelay(30 * 1000); // 30 seconds
    }

    @Override
    public void configureWebSocketTransport(@NonNull WebSocketTransportRegistration registration) {
        // Configure WebSocket transport settings
        registration.setMessageSizeLimit(1024 * 1024); // 1MB
        registration.setSendBufferSizeLimit(1024 * 1024); // 1MB
        registration.setSendTimeLimit(20000); // 20 seconds
    }
}
