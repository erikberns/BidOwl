// Centraliza respuestas de error y resolucion compatible de usuarios y tokens de sesion.
package com.bidowl.auctionplace.controllers;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.bidowl.auctionplace.service.SesionService;

final class ControllerSupport {

    private ControllerSupport() {
    }

    static Map<String, Object> errorBody(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", message);
        return error;
    }

    static Map<String, String> errorBodyWithStatus(String message, HttpStatus status) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        error.put("estado", status.toString());
        return error;
    }

    static Map<String, Object> errorBodyWithTimestamp(String message, Integer code) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", message);
        error.put("timestamp", LocalDate.now());
        if (code != null) {
            error.put("codigo", code);
        }
        return error;
    }

    static ResponseEntity<?> errorResponse(String message, HttpStatus status) {
        return ResponseEntity.status(status).body(errorBody(message));
    }

    static ResponseEntity<?> errorResponseWithStatus(String message, HttpStatus status) {
        return ResponseEntity.status(status).body(errorBodyWithStatus(message, status));
    }

    static Integer extractTokenIdOrDefault(String token, int defaultId) throws Exception {
        if (token == null || token.isEmpty()) {
            throw new Exception("Token no proporcionado");
        }
        try {
            return Integer.parseInt(token.trim());
        } catch (NumberFormatException e) {
            return defaultId;
        }
    }

    static Integer extractRequiredNumericTokenId(String token) throws Exception {
        if (token == null || token.isEmpty()) {
            throw new Exception("Token no proporcionado");
        }
        try {
            return Integer.parseInt(token.trim());
        } catch (NumberFormatException e) {
            throw new Exception("Token inválido. Para pruebas, envíe el ID numérico del usuario.");
        }
    }

    static Integer resolvePersonaId(String authorization, SesionService sesionService) throws Exception {
        return sesionService.resolverPersonaId(authorization);
    }

    static Integer resolvePersonaIdOrDefault(String authorization, SesionService sesionService, int defaultId) throws Exception {
        return sesionService.resolverPersonaId(authorization, defaultId);
    }
}
