package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.dto.MiSubastaDTO;
import com.bidowl.auctionplace.dto.NotificacionDTO;
import com.bidowl.auctionplace.dto.PujaActivaDTO;
import com.bidowl.auctionplace.entity.Notificacion;
import com.bidowl.auctionplace.entity.Pujo;
import com.bidowl.auctionplace.entity.Producto;
import com.bidowl.auctionplace.repository.NotificacionRepository;
import com.bidowl.auctionplace.repository.PujoRepository;
import com.bidowl.auctionplace.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InboxService {

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private PujoRepository pujoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    public List<NotificacionDTO> obtenerNotificaciones(Integer personaId) {
        List<Notificacion> notificaciones = notificacionRepository.findByPersonaIdOrderByFechaDesc(personaId);
        return notificaciones.stream().map(n -> {
            NotificacionDTO dto = new NotificacionDTO();
            dto.setId(n.getIdentificador());
            dto.setTitulo(n.getTitulo());
            dto.setBody(n.getCuerpo());
            dto.setAction(n.getAccion());
            dto.setLeida(n.isLeida());
            dto.setFechaOriginal(n.getFecha());

            // Format relative time
            Duration duration = Duration.between(n.getFecha(), LocalDateTime.now());
            if (duration.toMinutes() < 60) {
                dto.setTiempoFormateado("Hace " + duration.toMinutes() + " Minutos");
            } else if (duration.toHours() < 24) {
                dto.setTiempoFormateado("Hace " + duration.toHours() + " Horas");
            } else {
                dto.setTiempoFormateado("Hace " + duration.toDays() + " Días");
            }

            if ("show_inspection_request".equals(n.getAccion())) {
                dto.setButtonText("Revisar Solicitud del Articulo");
            } else if ("show_inspection_result".equals(n.getAccion())) {
                dto.setButtonText("Revisar Oferta del Articulo");
            } else if ("show_inspection_rejected".equals(n.getAccion())) {
                dto.setButtonText("Revisar Oferta del Articulo");
            }

            return dto;
        }).collect(Collectors.toList());
    }

    public List<PujaActivaDTO> obtenerPujasActivas(Integer personaId) {
        // En una implementación completa esto haría JOIN con Asistente, ItemCatalogo y Subasta
        // Por ahora devolvemos la data mockeada como se solicitó para agilizar la demo,
        // pero preparada en el controlador para ser devuelta como JSON dinámico.
        
        List<PujaActivaDTO> pujas = new ArrayList<>();
        
        PujaActivaDTO puja1 = new PujaActivaDTO();
        puja1.setId(1);
        puja1.setSubastaTitle("Subasta de Colección Original Rolling Stone");
        puja1.setLote(1);
        puja1.setTotalLotes(5);
        puja1.setArticuloTitle("Guitarra de Keith Richards");
        puja1.setMiPuja("$1.000.000 ARS");
        puja1.setPujaMaxima("$1.115.000 ARS");
        puja1.setEstado("Activa");
        
        PujaActivaDTO puja2 = new PujaActivaDTO();
        puja2.setId(2);
        puja2.setSubastaTitle("Subasta de Colección Original Rolling Stone");
        puja2.setLote(3);
        puja2.setTotalLotes(5);
        puja2.setArticuloTitle("Guitarra de Keith Richards");
        puja2.setMiPuja("$1.500.000 ARS");
        puja2.setPujaMaxima("$1.115.000 ARS");
        puja2.setEstado("Ganando");
        
        pujas.add(puja1);
        pujas.add(puja2);
        
        return pujas;
    }

    public List<MiSubastaDTO> obtenerMisSubastas(Integer personaId) {
        // Lo mismo aquí, implementamos el mock en el Service para el endpoint
        List<MiSubastaDTO> subastas = new ArrayList<>();
        
        MiSubastaDTO subasta = new MiSubastaDTO();
        subasta.setId(1);
        subasta.setSubastaTitle("Subasta de Colección Original Rolling Stone");
        subasta.setLote(4);
        subasta.setTotalLotes(5);
        subasta.setUbicacion("Depósito BidOwl Pilar");
        subasta.setArticuloTitle("Guitarra de Keith Richards");
        subasta.setPujaMaxima("$1.115.000 ARS");
        
        subastas.add(subasta);
        return subastas;
    }
}
