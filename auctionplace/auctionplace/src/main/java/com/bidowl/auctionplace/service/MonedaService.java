// Normaliza pesos y dolares y asegura compatibilidad entre subastas y pagos.
package com.bidowl.auctionplace.service;

import java.text.Normalizer;

import org.springframework.stereotype.Service;

import com.bidowl.auctionplace.entity.MetodoPago;
import com.bidowl.auctionplace.entity.PropuestaComercial;
import com.bidowl.auctionplace.entity.Subasta;

@Service
public class MonedaService {

    public static final String PESOS = "pesos";
    public static final String DOLARES = "dolares";

    public String normalizar(String moneda) {
        if (moneda == null || moneda.trim().isEmpty()) {
            return PESOS;
        }

        String valor = Normalizer.normalize(moneda.trim().toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        if ("peso".equals(valor) || PESOS.equals(valor) || "ars".equals(valor)) {
            return PESOS;
        }
        if ("dolar".equals(valor) || DOLARES.equals(valor) || "usd".equals(valor)) {
            return DOLARES;
        }

        throw new IllegalArgumentException("Moneda invalida. Use pesos o dolares.");
    }

    public String monedaSubasta(Subasta subasta) {
        return normalizar(subasta != null ? subasta.getMoneda() : null);
    }

    public String monedaPropuesta(PropuestaComercial propuesta) {
        return normalizar(propuesta != null ? propuesta.getMoneda() : null);
    }

    public String monedaMetodoPago(MetodoPago metodoPago) {
        if (metodoPago == null) {
            return PESOS;
        }
        if (metodoPago.getCuentaBancaria() != null) {
            return normalizar(metodoPago.getCuentaBancaria().getMoneda());
        }
        if (metodoPago.getChequeCertificado() != null) {
            return normalizar(metodoPago.getChequeCertificado().getMoneda());
        }
        return PESOS;
    }

    public void validarMismaMoneda(String esperada, String recibida, String contexto) {
        String normalizadaEsperada = normalizar(esperada);
        String normalizadaRecibida = normalizar(recibida);
        if (!normalizadaEsperada.equals(normalizadaRecibida)) {
            throw new IllegalArgumentException(contexto + " debe estar en " + normalizadaEsperada + ", pero esta en " + normalizadaRecibida + ".");
        }
    }

    public void validarMetodoPagoCompatible(String monedaSubasta, MetodoPago metodoPago) {
        validarMismaMoneda(monedaSubasta, monedaMetodoPago(metodoPago), "El metodo de pago");
    }
}
