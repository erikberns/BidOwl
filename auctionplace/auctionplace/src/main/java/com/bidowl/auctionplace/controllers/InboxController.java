package com.bidowl.auctionplace.controllers;

import com.bidowl.auctionplace.dto.MiSubastaDTO;
import com.bidowl.auctionplace.dto.NotificacionDTO;
import com.bidowl.auctionplace.dto.PujaActivaDTO;
import com.bidowl.auctionplace.service.InboxService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inbox")
@CrossOrigin(origins = "*")
public class InboxController {

    @Autowired
    private InboxService inboxService;

    @GetMapping("/{personaId}/notificaciones")
    public ResponseEntity<List<NotificacionDTO>> obtenerNotificaciones(@PathVariable Integer personaId) {
        return ResponseEntity.ok(inboxService.obtenerNotificaciones(personaId));
    }

    @GetMapping("/{personaId}/pujas-activas")
    public ResponseEntity<List<PujaActivaDTO>> obtenerPujasActivas(@PathVariable Integer personaId) {
        return ResponseEntity.ok(inboxService.obtenerPujasActivas(personaId));
    }

    @GetMapping("/{personaId}/mis-subastas")
    public ResponseEntity<List<MiSubastaDTO>> obtenerMisSubastas(@PathVariable Integer personaId) {
        return ResponseEntity.ok(inboxService.obtenerMisSubastas(personaId));
    }
}
