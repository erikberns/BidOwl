// Recibe pujas por STOMP y publica eventos o errores en los canales de la subasta.
package com.bidowl.auctionplace.controllers;

import com.bidowl.auctionplace.dto.PujaWebSocketEventDTO;
import com.bidowl.auctionplace.entity.ItemCatalogo;
import com.bidowl.auctionplace.entity.SesionPersona;
import com.bidowl.auctionplace.service.PujoService;
import com.bidowl.auctionplace.service.SesionService;
import com.bidowl.auctionplace.service.SubastaConexionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.math.BigDecimal;
import java.util.Optional;

@Controller
public class PujaWebSocketController {

    @Autowired
    private PujoService pujoService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private SesionService sesionService;

    @Autowired
    private SubastaConexionService subastaConexionService;

    @MessageMapping("/subasta/{subastaId}/pujar")
    public void procesarPuja(@DestinationVariable Integer subastaId, PujaWSRequest request) {
        try {
            Integer clienteIdConexion = resolverClienteIdConexion(subastaId, request);
            SesionPersona sesion = resolverSesion(request);
            subastaConexionService.registrarConexion(clienteIdConexion, subastaId, sesion);

            pujoService.registrarPujaEnSubasta(
                    subastaId,
                    request.getItemId(),
                    request.getImporte(),
                    request.getIdMetodoPago(),
                    clienteIdConexion);
        } catch (Exception e) {
            Optional<ItemCatalogo> item = pujoService.buscarItemEnSubasta(subastaId, request.getItemId());
            if (item.isPresent() && "si".equalsIgnoreCase(item.get().getSubastado())) {
                enviarEvento(subastaId, request.getItemId(),
                        PujaWebSocketEventDTO.itemFinalizado(subastaId, item.get(), "El item ha finalizado."));
            }

            if (pujoService.subastaEstaCerrada(subastaId)) {
                enviarEvento(subastaId, request.getItemId(),
                        PujaWebSocketEventDTO.subastaCerrada(subastaId, "La subasta ha finalizado."));
            }

            enviarEvento(subastaId, request.getItemId(),
                    PujaWebSocketEventDTO.error(subastaId, request.getItemId(), request.getAsistenteId(), request.getClienteId(), e.getMessage()));
        }
    }

    private void enviarEvento(Integer subastaId, Integer itemId, PujaWebSocketEventDTO event) {
        messagingTemplate.convertAndSend("/topic/subasta/" + subastaId, event);
        if (itemId != null) {
            messagingTemplate.convertAndSend("/topic/subasta/" + subastaId + "/items/" + itemId, event);
        }
    }

    private Integer resolverClienteIdConexion(Integer subastaId, PujaWSRequest request) throws Exception {
        SesionPersona sesion = resolverSesion(request);
        if (sesion != null && sesion.getPersona() != null) {
            return sesion.getPersona().getIdentificador();
        }
        if (request.getClienteId() != null) {
            return request.getClienteId();
        }
        if (request.getAsistenteId() != null) {
            return pujoService.obtenerClienteIdDesdeAsistente(request.getAsistenteId(), subastaId);
        }
        throw new IllegalArgumentException("Debe indicar clienteId, asistenteId o tokenSesion.");
    }

    private SesionPersona resolverSesion(PujaWSRequest request) throws Exception {
        if (request.getTokenSesion() == null || request.getTokenSesion().trim().isEmpty()) {
            return null;
        }
        return sesionService.resolverSesionActiva(request.getTokenSesion());
    }

    public static class PujaWSRequest {
        private Integer asistenteId;
        private Integer clienteId;
        private Integer itemId;
        private BigDecimal importe;
        private String idMetodoPago;
        private String tokenSesion;

        public Integer getAsistenteId() { return asistenteId; }
        public void setAsistenteId(Integer asistenteId) { this.asistenteId = asistenteId; }
        public Integer getClienteId() { return clienteId; }
        public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }
        public Integer getItemId() { return itemId; }
        public void setItemId(Integer itemId) { this.itemId = itemId; }
        public BigDecimal getImporte() { return importe; }
        public void setImporte(BigDecimal importe) { this.importe = importe; }
        public String getIdMetodoPago() { return idMetodoPago; }
        public void setIdMetodoPago(String idMetodoPago) { this.idMetodoPago = idMetodoPago; }
        public String getTokenSesion() { return tokenSesion; }
        public void setTokenSesion(String tokenSesion) { this.tokenSesion = tokenSesion; }
    }
}
