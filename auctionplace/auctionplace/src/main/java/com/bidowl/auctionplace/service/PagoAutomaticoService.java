package com.bidowl.auctionplace.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bidowl.auctionplace.entity.RegistroDeSubasta;
import com.bidowl.auctionplace.repository.RegistroDeSubastaRepository;

@Service
public class PagoAutomaticoService {

    public static final String COMPLETO = "COMPLETO";
    public static final String INCOMPLETO = "INCOMPLETO";

    @Autowired
    private LimiteMetodoPagoService limiteService;

    @Autowired
    private RegistroDeSubastaRepository registroRepository;

    @Autowired
    private ClientePenalizacionService penalizacionService;

    @Transactional
    public boolean procesar(RegistroDeSubasta registro) {
        BigDecimal importeEntero = limiteService.entero(registro.getImporte());
        BigDecimal limite = limiteService.obtenerLimiteEfectivo(registro.getMetodoPago());
        boolean pagoCompleto = limite == null || limite.compareTo(importeEntero) >= 0;

        registro.setFechaIntentoPago(LocalDateTime.now());
        registro.setEstadoPago(pagoCompleto ? COMPLETO : INCOMPLETO);
        registro.setMontoPagado(pagoCompleto ? importeEntero : BigDecimal.ZERO);
        registroRepository.save(registro);

        if (!pagoCompleto) {
            penalizacionService.generarMultaPorFaltaDePago(registro);
        }
        return pagoCompleto;
    }
}
