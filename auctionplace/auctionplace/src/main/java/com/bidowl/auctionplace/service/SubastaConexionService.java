package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.entity.Persona;
import com.bidowl.auctionplace.entity.SesionPersona;
import com.bidowl.auctionplace.entity.Subasta;
import com.bidowl.auctionplace.entity.SubastaConexionActiva;
import com.bidowl.auctionplace.repository.PersonaRepository;
import com.bidowl.auctionplace.repository.SubastaConexionActivaRepository;
import com.bidowl.auctionplace.repository.SubastaRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubastaConexionService {

    @Autowired
    private SubastaConexionActivaRepository subastaConexionActivaRepository;

    @Autowired
    private PersonaRepository personaRepository;

    @Autowired
    private SubastaRepository subastaRepository;

    @Transactional
    public SubastaConexionActiva registrarConexion(Integer personaId, Integer subastaId, SesionPersona sesion) {
        Persona persona = personaRepository.findById(personaId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Persona no encontrada: " + personaId));
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Subasta no encontrada: " + subastaId));

        Optional<SubastaConexionActiva> activa = subastaConexionActivaRepository
                .findFirstByPersonaIdentificadorAndActivaTrueOrderByFechaActualizacionDesc(personaId);

        if (activa.isPresent()) {
            SubastaConexionActiva conexion = activa.get();
            Integer subastaActivaId = conexion.getSubasta() != null ? conexion.getSubasta().getIdentificador() : null;
            if (subastaActivaId != null && !subastaActivaId.equals(subastaId)) {
                throw new IllegalStateException("Ya estas conectado a otra subasta activa: " + subastaActivaId);
            }
            conexion.setSesion(sesion != null ? sesion : conexion.getSesion());
            conexion.setFechaActualizacion(LocalDateTime.now());
            return subastaConexionActivaRepository.save(conexion);
        }

        SubastaConexionActiva nueva = new SubastaConexionActiva();
        nueva.setPersona(persona);
        nueva.setSesion(sesion);
        nueva.setSubasta(subasta);
        nueva.setFechaConexion(LocalDateTime.now());
        nueva.setFechaActualizacion(LocalDateTime.now());
        nueva.setActiva(true);
        return subastaConexionActivaRepository.save(nueva);
    }

    @Transactional(readOnly = true)
    public void validarConexion(Integer personaId, Integer subastaId) {
        Optional<SubastaConexionActiva> activa = subastaConexionActivaRepository
                .findFirstByPersonaIdentificadorAndActivaTrueOrderByFechaActualizacionDesc(personaId);
        if (activa.isEmpty()) {
            return;
        }
        Integer subastaActivaId = activa.get().getSubasta() != null
                ? activa.get().getSubasta().getIdentificador()
                : null;
        if (subastaActivaId != null && !subastaActivaId.equals(subastaId)) {
            throw new IllegalStateException("Ya estas conectado a otra subasta activa: " + subastaActivaId);
        }
    }

    @Transactional
    public void desconectar(Integer personaId, Integer subastaId) {
        subastaConexionActivaRepository
                .findFirstByPersonaIdentificadorAndSubastaIdentificadorAndActivaTrue(personaId, subastaId)
                .ifPresent(conexion -> {
                    conexion.setActiva(false);
                    conexion.setFechaActualizacion(LocalDateTime.now());
                    subastaConexionActivaRepository.save(conexion);
                });
    }
}
