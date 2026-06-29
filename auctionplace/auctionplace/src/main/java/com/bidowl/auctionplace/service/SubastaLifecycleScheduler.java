// Finaliza lotes vencidos y cierra subastas aunque no haya clientes conectados.
package com.bidowl.auctionplace.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.bidowl.auctionplace.dto.PujaWebSocketEventDTO;
import com.bidowl.auctionplace.entity.ItemCatalogo;
import com.bidowl.auctionplace.entity.Subasta;
import com.bidowl.auctionplace.repository.ItemCatalogoRepository;
import com.bidowl.auctionplace.repository.SubastaRepository;

@Service
public class SubastaLifecycleScheduler {

    private static final Logger LOGGER = LoggerFactory.getLogger(SubastaLifecycleScheduler.class);
    private static final ZoneId ARGENTINA_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");

    private volatile boolean applicationReady;

    @Autowired
    private SubastaRepository subastaRepository;

    @Autowired
    private ItemCatalogoRepository itemCatalogoRepository;

    @Autowired
    private ItemCatalogoService itemCatalogoService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void habilitarProcesamiento() {
        applicationReady = true;
    }

    @Scheduled(
            fixedDelayString = "${bidowl.auctions.lifecycle-interval-ms:5000}",
            initialDelayString = "${bidowl.auctions.lifecycle-initial-delay-ms:10000}")
    public void finalizarLotesVencidos() {
        if (!applicationReady) {
            return;
        }
        LocalDateTime ahora = LocalDateTime.now(ARGENTINA_ZONE);
        for (Subasta subasta : subastaRepository.findByEstado("abierta")) {
            procesarSubasta(subasta, ahora);
        }
    }

    private void procesarSubasta(Subasta subasta, LocalDateTime ahora) {
        List<ItemCatalogo> items = itemCatalogoRepository.findByCatalogoSubastaIdentificador(subasta.getIdentificador());
        items.sort(Comparator.comparing(ItemCatalogo::getIdentificador));

        ItemCatalogo itemActivo = items.stream()
                .filter(item -> !"si".equalsIgnoreCase(item.getSubastado()))
                .findFirst()
                .orElse(null);

        if (itemActivo == null) {
            cerrarSubastaPendiente(subasta);
            return;
        }
        if (itemActivo.getFechaFinPuja() == null || ahora.isBefore(itemActivo.getFechaFinPuja())) {
            return;
        }

        try {
            ItemCatalogo finalizado = itemCatalogoService.finalizarSubastaDeItem(itemActivo.getIdentificador());
            enviarEvento(subasta.getIdentificador(), finalizado.getIdentificador(),
                    PujaWebSocketEventDTO.itemFinalizado(
                            subasta.getIdentificador(), finalizado, "El item ha finalizado automaticamente."));

            Subasta actualizada = subastaRepository.findById(subasta.getIdentificador()).orElse(subasta);
            if ("carrada".equalsIgnoreCase(actualizada.getEstado())) {
                enviarEvento(subasta.getIdentificador(), finalizado.getIdentificador(),
                        PujaWebSocketEventDTO.subastaCerrada(
                                subasta.getIdentificador(), "La subasta ha finalizado."));
            }
        } catch (Exception e) {
            ItemCatalogo estadoActual = itemCatalogoRepository.findById(itemActivo.getIdentificador()).orElse(null);
            if (estadoActual == null || !"si".equalsIgnoreCase(estadoActual.getSubastado())) {
                LOGGER.warn("No se pudo finalizar automaticamente el item {} de la subasta {}: {}",
                        itemActivo.getIdentificador(), subasta.getIdentificador(), e.getMessage());
            }
        }
    }

    private void cerrarSubastaPendiente(Subasta subasta) {
        subasta.setEstado("carrada");
        subastaRepository.save(subasta);
        enviarEvento(subasta.getIdentificador(), null,
                PujaWebSocketEventDTO.subastaCerrada(subasta.getIdentificador(), "La subasta ha finalizado."));
    }

    private void enviarEvento(Integer subastaId, Integer itemId, PujaWebSocketEventDTO evento) {
        messagingTemplate.convertAndSend("/topic/subasta/" + subastaId, evento);
        if (itemId != null) {
            messagingTemplate.convertAndSend("/topic/subasta/" + subastaId + "/items/" + itemId, evento);
        }
    }
}
