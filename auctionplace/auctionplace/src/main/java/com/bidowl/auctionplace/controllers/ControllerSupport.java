// Centraliza respuestas de error y resolucion compatible de usuarios y tokens de sesion.
package com.bidowl.auctionplace.controllers;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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

    static ResponseEntity<byte[]> imageResponse(byte[] bytes) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-store, no-cache, must-revalidate, max-age=0")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .contentType(detectImageMediaType(bytes))
                .body(bytes);
    }

    private static MediaType detectImageMediaType(byte[] bytes) {
        if (bytes != null && bytes.length >= 4
                && (bytes[0] & 0xFF) == 0x89
                && bytes[1] == 0x50
                && bytes[2] == 0x4E
                && bytes[3] == 0x47) {
            return MediaType.IMAGE_PNG;
        }
        if (bytes != null && bytes.length >= 3
                && (bytes[0] & 0xFF) == 0xFF
                && (bytes[1] & 0xFF) == 0xD8
                && (bytes[2] & 0xFF) == 0xFF) {
            return MediaType.IMAGE_JPEG;
        }
        if (bytes != null && bytes.length >= 6
                && bytes[0] == 'G'
                && bytes[1] == 'I'
                && bytes[2] == 'F') {
            return MediaType.IMAGE_GIF;
        }
        if (bytes != null && bytes.length >= 12
                && bytes[0] == 'R'
                && bytes[1] == 'I'
                && bytes[2] == 'F'
                && bytes[3] == 'F'
                && bytes[8] == 'W'
                && bytes[9] == 'E'
                && bytes[10] == 'B'
                && bytes[11] == 'P') {
            return MediaType.parseMediaType("image/webp");
        }
        return MediaType.APPLICATION_OCTET_STREAM;
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
