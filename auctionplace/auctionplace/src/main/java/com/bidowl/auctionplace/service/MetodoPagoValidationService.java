// Valida propiedad, moneda y disponibilidad del medio de pago elegido para pujar.
package com.bidowl.auctionplace.service;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bidowl.auctionplace.entity.MetodoPago;
import com.bidowl.auctionplace.entity.Subasta;
import com.bidowl.auctionplace.repository.MetodoPagoRepository;

@Service
public class MetodoPagoValidationService {

    @Autowired
    private MetodoPagoRepository metodoPagoRepository;

    @Autowired
    private MonedaService monedaService;

    @Autowired
    private ChequeCompromisoService chequeCompromisoService;

    @Transactional
    public MetodoPago obtenerCompatibleParaPuja(Integer clienteId, String idMetodoPago, Subasta subasta, BigDecimal monto, Integer itemId) {
        if (clienteId == null) {
            throw new IllegalArgumentException("No se pudo identificar al cliente de la puja.");
        }
        if (idMetodoPago == null || idMetodoPago.trim().isEmpty()) {
            throw new IllegalArgumentException("Debe seleccionar un metodo de pago para pujar.");
        }

        Integer metodoPagoId;
        try {
            metodoPagoId = Integer.parseInt(idMetodoPago.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("El metodo de pago seleccionado no es valido.");
        }

        MetodoPago metodoPago = metodoPagoRepository
                .findByIdentificadorAndPersonaIdentificador(metodoPagoId, clienteId)
                .orElseThrow(() -> new IllegalArgumentException("El metodo de pago seleccionado no existe o no pertenece al cliente."));

        String monedaSubasta = monedaService.monedaSubasta(subasta);
        monedaService.validarMetodoPagoCompatible(monedaSubasta, metodoPago);
        chequeCompromisoService.validarDisponibleParaPuja(metodoPago, monto, itemId, monedaSubasta);

        return metodoPago;
    }
}
