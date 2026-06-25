package com.bidowl.auctionplace.controllers;

import com.bidowl.auctionplace.dto.MiSubastaDTO;
import com.bidowl.auctionplace.dto.NotificacionDTO;
import com.bidowl.auctionplace.dto.PujaActivaDTO;
import com.bidowl.auctionplace.dto.WonItemDetailDTO;
import com.bidowl.auctionplace.dto.HistorialPujaUsuarioDTO;
import com.bidowl.auctionplace.service.ClientePenalizacionService;
import com.bidowl.auctionplace.service.InboxService;
import com.bidowl.auctionplace.service.SesionService;
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
    private SesionService sesionService;

    @Autowired
    private ClientePenalizacionService clientePenalizacionService;

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

    @GetMapping("/deudas/pendiente")
    public ResponseEntity<?> obtenerDeudaPendiente(@RequestHeader("Autorizacion") String autorizacion) {
        try {
            Integer clienteId = ControllerSupport.resolvePersonaId(autorizacion, sesionService);
            return ResponseEntity.ok(clientePenalizacionService.obtenerBloqueoActivo(clienteId)
                    .map(deuda -> {
                        Map<String, Object> response = new HashMap<>();
                        response.put("pendiente", true);
                        response.put("deudaId", deuda.getIdentificador());
                        response.put("estado", deuda.getEstado());
                        response.put("montoOriginal", deuda.getMontoOriginal());
                        response.put("montoMulta", deuda.getMontoMulta());
                        response.put("montoTotal", deuda.getMontoTotal());
                        response.put("fechaGeneracion", deuda.getFechaGeneracion());
                        response.put("fechaVencimiento", deuda.getFechaVencimiento());
                        return response;
                    })
                    .orElseGet(() -> {
                        Map<String, Object> response = new HashMap<>();
                        response.put("pendiente", false);
                        return response;
                    }));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ControllerSupport.errorBody(e.getMessage()));
        }
    }

    @PostMapping("/won-item/{itemId}/confirmar-entrega")
    public ResponseEntity<?> confirmarEntrega(
            @PathVariable Integer itemId,
            @RequestBody Map<String, Object> body,
            @RequestHeader("Autorizacion") String autorizacion) {
        try {
            String tipoEntrega = (String) body.get("tipoEntrega");
            java.math.BigDecimal costoEnvio = java.math.BigDecimal.ZERO;
            if (body.get("costoEnvio") != null) {
                costoEnvio = new java.math.BigDecimal(body.get("costoEnvio").toString());
            }
            Integer clienteId = ControllerSupport.resolvePersonaId(autorizacion, sesionService);

            boolean noPuedePagar = esVerdadero(body.get("noPuedePagar"))
                    || esFalso(body.get("puedePagar"));
            if (noPuedePagar) {
                com.bidowl.auctionplace.entity.ClienteDeudaSubasta deuda = inboxService.registrarFaltaDePago(itemId, clienteId);

                Map<String, Object> response = new HashMap<>();
                response.put("status", "deuda_pendiente");
                response.put("mensaje", "Se registro una multa del 10% y la participacion queda suspendida hasta regularizar.");
                response.put("deudaId", deuda.getIdentificador());
                response.put("montoMulta", deuda.getMontoMulta());
                response.put("montoTotal", deuda.getMontoTotal());
                response.put("fechaVencimiento", deuda.getFechaVencimiento());
                return ResponseEntity.ok(response);
            }
            
            inboxService.registrarConfirmacionEntrega(itemId, tipoEntrega, costoEnvio, clienteId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("mensaje", "La transacción se ha registrado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ControllerSupport.errorBody(e.getMessage()));
        }
    }

    @PostMapping("/deudas/{deudaId}/regularizar")
    public ResponseEntity<?> regularizarDeuda(
            @PathVariable Integer deudaId,
            @RequestHeader("Autorizacion") String autorizacion) {
        try {
            Integer clienteId = ControllerSupport.resolvePersonaId(autorizacion, sesionService);
            com.bidowl.auctionplace.entity.ClienteDeudaSubasta deuda = inboxService.regularizarDeuda(deudaId, clienteId);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("mensaje", "Deuda regularizada. La participacion queda rehabilitada.");
            response.put("deudaId", deuda.getIdentificador());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ControllerSupport.errorBody(e.getMessage()));
        }
    }

    private boolean esVerdadero(Object valor) {
        return Boolean.TRUE.equals(valor) || "true".equalsIgnoreCase(String.valueOf(valor));
    }

    private boolean esFalso(Object valor) {
        return Boolean.FALSE.equals(valor) || "false".equalsIgnoreCase(String.valueOf(valor));
    }
}
