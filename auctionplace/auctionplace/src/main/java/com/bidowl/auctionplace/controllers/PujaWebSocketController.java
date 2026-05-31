package com.bidowl.auctionplace.controllers;

import com.bidowl.auctionplace.entity.Pujo;
import com.bidowl.auctionplace.service.PujoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Controller
public class PujaWebSocketController {

    @Autowired
    private PujoService pujoService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/subasta/{subastaId}/pujar")
    public void procesarPuja(@DestinationVariable Integer subastaId, PujaWSRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Registrar y validar la puja con las reglas incrementales
            Pujo pujoGuardada = pujoService.registrarPuja(
                    request.getAsistenteId(),
                    request.getItemId(),
                    request.getImporte()
            );

            // Armar respuesta exitosa
            response.put("status", "SUCCESS");
            response.put("mensaje", "Nueva oferta líder registrada.");
            response.put("pujo", pujoGuardada);

            // Difundir la nueva puja líder a todos los suscritos a la subasta
            messagingTemplate.convertAndSend("/topic/subasta/" + subastaId, (Object) response);

        } catch (Exception e) {
            // Enviar mensaje de error
            response.put("status", "ERROR");
            response.put("mensaje", e.getMessage());
            response.put("asistenteId", request.getAsistenteId());
            response.put("itemId", request.getItemId());

            // Difundir el error (o se puede enviar privado al usuario)
            messagingTemplate.convertAndSend("/topic/subasta/" + subastaId, (Object) response);
        }
    }

    // --- Clase Request DTO ---
    public static class PujaWSRequest {
        private Integer asistenteId;
        private Integer itemId;
        private BigDecimal importe;

        public Integer getAsistenteId() { return asistenteId; }
        public void setAsistenteId(Integer asistenteId) { this.asistenteId = asistenteId; }
        public Integer getItemId() { return itemId; }
        public void setItemId(Integer itemId) { this.itemId = itemId; }
        public BigDecimal getImporte() { return importe; }
        public void setImporte(BigDecimal importe) { this.importe = importe; }
    }
}
