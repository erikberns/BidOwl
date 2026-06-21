package com.bidowl.auctionplace.controllers;

import com.bidowl.auctionplace.dto.MiSubastaDTO;
import com.bidowl.auctionplace.dto.NotificacionDTO;
import com.bidowl.auctionplace.dto.PujaActivaDTO;
import com.bidowl.auctionplace.dto.WonItemDetailDTO;
import com.bidowl.auctionplace.dto.HistorialPujaUsuarioDTO;
import com.bidowl.auctionplace.repository.NotificacionRepository;
import com.bidowl.auctionplace.service.InboxService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inbox")
@CrossOrigin(origins = "*")
public class InboxController {

    @Autowired
    private InboxService inboxService;

    @Autowired
    private NotificacionRepository notificacionRepository;

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

    @GetMapping("/{personaId}/historial")
    public ResponseEntity<List<HistorialPujaUsuarioDTO>> obtenerHistorial(@PathVariable Integer personaId) {
        return ResponseEntity.ok(inboxService.obtenerHistorial(personaId));
    }

    @GetMapping("/won-item/{itemId}")
    public ResponseEntity<WonItemDetailDTO> obtenerDetalleItemGanado(@PathVariable Integer itemId) {
        return ResponseEntity.ok(inboxService.obtenerDetalleItemGanado(itemId));
    }

    @PostMapping("/won-item/{itemId}/confirmar-entrega")
    public ResponseEntity<?> confirmarEntrega(
            @PathVariable Integer itemId,
            @RequestBody Map<String, Object> body,
            @RequestHeader("Autorizacion") String autorizacion) {
        try {
            String accion = "show_bid_won:" + itemId;
            Integer clienteId = Integer.parseInt(autorizacion.trim());
            List<com.bidowl.auctionplace.entity.Notificacion> notifs = notificacionRepository.findByPersonaIdOrderByFechaDesc(clienteId);
            for (com.bidowl.auctionplace.entity.Notificacion n : notifs) {
                if (accion.equals(n.getAccion())) {
                    n.setLeida(true);
                    notificacionRepository.save(n);
                }
            }
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("mensaje", "La transacción se ha registrado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
