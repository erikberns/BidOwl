package com.bidowl.auctionplace.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bidowl.auctionplace.entity.LimiteMetodoPago;
import com.bidowl.auctionplace.entity.MetodoPago;
import com.bidowl.auctionplace.repository.LimiteMetodoPagoRepository;

@Service
public class LimiteMetodoPagoService {

    @Autowired
    private LimiteMetodoPagoRepository limiteRepository;

    @Transactional
    public LimiteMetodoPago guardar(MetodoPago metodoPago, BigDecimal limiteMaximo) {
        if (metodoPago == null || metodoPago.getIdentificador() == null) {
            throw new IllegalArgumentException("El metodo de pago no es valido.");
        }
        if (limiteMaximo == null) {
            quitar(metodoPago);
            return null;
        }
        if (limiteMaximo.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El limite maximo debe ser mayor a cero.");
        }

        LimiteMetodoPago limite = limiteRepository.findByMetodoPagoIdentificador(metodoPago.getIdentificador())
                .orElseGet(LimiteMetodoPago::new);
        limite.setMetodoPago(metodoPago);
        limite.setLimiteMaximo(entero(limiteMaximo));
        LimiteMetodoPago guardado = limiteRepository.save(limite);
        metodoPago.setLimitePago(guardado);
        return guardado;
    }

    @Transactional
    public Optional<LimiteMetodoPago> obtener(MetodoPago metodoPago) {
        Optional<LimiteMetodoPago> limite = limiteRepository.findByMetodoPagoIdentificador(metodoPago.getIdentificador());
        metodoPago.setLimitePago(limite.orElse(null));
        return limite;
    }

    public BigDecimal obtenerLimiteEfectivo(MetodoPago metodoPago) {
        BigDecimal limiteElegido = obtener(metodoPago)
                .map(LimiteMetodoPago::getLimiteMaximo)
                .orElse(null);
        BigDecimal montoCheque = metodoPago.getChequeCertificado() != null
                ? metodoPago.getChequeCertificado().getMonto()
                : null;

        if (limiteElegido == null) {
            return montoCheque != null ? entero(montoCheque) : null;
        }
        if (montoCheque == null) {
            return limiteElegido;
        }
        return limiteElegido.min(entero(montoCheque));
    }

    @Transactional
    public void quitar(MetodoPago metodoPago) {
        limiteRepository.findByMetodoPagoIdentificador(metodoPago.getIdentificador())
                .ifPresent(limiteRepository::delete);
        metodoPago.setLimitePago(null);
    }

    public BigDecimal entero(BigDecimal valor) {
        return valor.setScale(0, RoundingMode.DOWN);
    }
}
