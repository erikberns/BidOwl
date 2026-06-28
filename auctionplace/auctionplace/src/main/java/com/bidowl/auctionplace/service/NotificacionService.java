// Persiste notificaciones evitando duplicados para un mismo usuario y evento.
package com.bidowl.auctionplace.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bidowl.auctionplace.entity.Notificacion;
import com.bidowl.auctionplace.repository.NotificacionRepository;

@Service
public class NotificacionService {

    @Autowired
    private NotificacionRepository notificacionRepository;

    public void guardarSiNoExiste(Notificacion notificacion) {
        if (notificacion.getPersonaId() == null) {
            return;
        }
        List<Notificacion> existencias = notificacionRepository.findByPersonaIdOrderByFechaDesc(notificacion.getPersonaId());
        boolean yaExiste = existencias.stream()
                .anyMatch(n -> notificacion.getAccion() != null && notificacion.getAccion().equals(n.getAccion()));
        if (!yaExiste) {
            notificacionRepository.save(notificacion);
        }
    }
}
