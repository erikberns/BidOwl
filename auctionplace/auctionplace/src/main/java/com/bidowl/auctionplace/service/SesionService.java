// Crea, resuelve y valida tokens de sesion independientes por dispositivo.
package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.entity.Persona;
import com.bidowl.auctionplace.entity.SesionPersona;
import com.bidowl.auctionplace.repository.PersonaRepository;
import com.bidowl.auctionplace.repository.SesionPersonaRepository;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SesionService {

    private static final int DIAS_DURACION_SESION = 7;

    @Autowired
    private SesionPersonaRepository sesionPersonaRepository;

    @Autowired
    private PersonaRepository personaRepository;

    public SesionPersona crearSesion(Persona persona) {
        SesionPersona sesion = new SesionPersona();
        sesion.setPersona(persona);
        sesion.setToken(UUID.randomUUID().toString());
        sesion.setFechaCreacion(LocalDateTime.now());
        sesion.setFechaExpiracion(LocalDateTime.now().plusDays(DIAS_DURACION_SESION));
        sesion.setActiva(true);
        return sesionPersonaRepository.save(sesion);
    }

    public Integer resolverPersonaId(String autorizacion) throws Exception {
        return resolverPersonaId(autorizacion, null);
    }

    public Integer resolverPersonaId(String autorizacion, Integer defaultId) throws Exception {
        if (autorizacion == null || autorizacion.trim().isEmpty()) {
            if (defaultId != null) {
                return defaultId;
            }
            throw new Exception("Token no proporcionado");
        }

        String valor = limpiarBearer(autorizacion.trim());
        try {
            return Integer.parseInt(valor);
        } catch (NumberFormatException ignored) {
            return resolverToken(valor);
        }
    }

    public SesionPersona resolverSesionActiva(String autorizacion) throws Exception {
        if (autorizacion == null || autorizacion.trim().isEmpty()) {
            throw new Exception("Token no proporcionado");
        }
        String token = limpiarBearer(autorizacion.trim());
        return obtenerSesionActivaPorToken(token);
    }

    private Integer resolverToken(String token) throws Exception {
        SesionPersona sesion = obtenerSesionActivaPorToken(token);
        Persona persona = sesion.getPersona();
        if (persona == null || persona.getIdentificador() == null) {
            throw new Exception("Token invalido o sesion expirada");
        }
        if (!personaRepository.existsById(persona.getIdentificador())) {
            throw new Exception("Token invalido o sesion expirada");
        }
        return persona.getIdentificador();
    }

    private SesionPersona obtenerSesionActivaPorToken(String token) throws Exception {
        SesionPersona sesion = sesionPersonaRepository.findByTokenAndActivaTrue(token)
                .orElseThrow(() -> new Exception("Token invalido o sesion expirada"));

        if (sesion.getFechaExpiracion() != null && sesion.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            sesion.setActiva(false);
            sesionPersonaRepository.save(sesion);
            throw new Exception("Token invalido o sesion expirada");
        }
        return sesion;
    }

    private String limpiarBearer(String autorizacion) {
        if (autorizacion.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return autorizacion.substring(7).trim();
        }
        return autorizacion;
    }
}
