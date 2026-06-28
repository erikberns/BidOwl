// Configura STOMP, SockJS y los canales WebSocket usados por las pujas en tiempo real.
package com.bidowl.auctionplace.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Habilita un broker simple en memoria para enviar mensajes a los clientes
        config.enableSimpleBroker("/topic");
        // Prefijo para los mensajes dirigidos a los métodos anotados con @MessageMapping en los controladores
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint que los clientes usarán para conectarse al WebSocket
        registry.addEndpoint("/ws-bidowl")
                .setAllowedOriginPatterns("*")
                .withSockJS();
        
        // Registrar sin SockJS por si el cliente móvil prefiere conexión WebSocket pura
        registry.addEndpoint("/ws-bidowl")
                .setAllowedOriginPatterns("*");
    }
}
