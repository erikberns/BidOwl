// Controla y actualiza el monto de cheque comprometido entre distintas pujas.
package com.bidowl.auctionplace.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bidowl.auctionplace.entity.ChequeCertificado;
import com.bidowl.auctionplace.entity.ChequeCertificadoCompromiso;
import com.bidowl.auctionplace.entity.MetodoPago;
import com.bidowl.auctionplace.entity.Pujo;
import com.bidowl.auctionplace.repository.ChequeCertificadoRepository;
import com.bidowl.auctionplace.repository.ChequeCertificadoCompromisoRepository;

@Service
public class ChequeCompromisoService {

    @Autowired
    private ChequeCertificadoCompromisoRepository compromisoRepository;

    @Autowired
    private ChequeCertificadoRepository chequeCertificadoRepository;

    public void validarDisponibleParaPuja(MetodoPago metodoPago, BigDecimal monto, Integer itemId, String monedaSubasta) {
        ChequeCertificado cheque = obtenerCheque(metodoPago);
        if (cheque == null || monto == null) {
            return;
        }

        ChequeCertificado chequeBloqueado = chequeCertificadoRepository.findByIdentificador(cheque.getIdentificador())
                .orElse(cheque);
        BigDecimal montoCheque = chequeBloqueado.getMonto() != null ? chequeBloqueado.getMonto() : BigDecimal.ZERO;
        BigDecimal comprometido = compromisoRepository.sumMontoActivoByChequeExcluyendoItem(chequeBloqueado.getIdentificador(), itemId);
        BigDecimal disponible = montoCheque.subtract(comprometido != null ? comprometido : BigDecimal.ZERO);

        if (disponible.compareTo(monto) < 0) {
            throw new IllegalArgumentException("El cheque certificado tiene " + disponible + " " + monedaSubasta
                    + " disponibles. Ya hay " + comprometido + " " + monedaSubasta
                    + " comprometidos en otras subastas.");
        }
    }

    @Transactional
    public void registrarCompromisoParaPuja(Pujo puja) {
        ChequeCertificado cheque = obtenerCheque(puja != null ? puja.getMetodoPago() : null);
        if (cheque == null || puja.getItem() == null) {
            return;
        }

        liberarCompromisosActivosDelItem(puja.getItem().getIdentificador());

        ChequeCertificadoCompromiso compromiso = new ChequeCertificadoCompromiso();
        compromiso.setChequeCertificado(cheque);
        compromiso.setPujo(puja);
        compromiso.setItem(puja.getItem());
        compromiso.setMonto(puja.getImporte());
        compromiso.setEstado(ChequeCertificadoCompromiso.ACTIVO);
        compromiso.setFechaHora(LocalDateTime.now());
        compromisoRepository.save(compromiso);
    }

    @Transactional
    public void ejecutarCompromisoGanador(Pujo pujaGanadora) {
        if (pujaGanadora == null || pujaGanadora.getItem() == null) {
            return;
        }

        Integer itemId = pujaGanadora.getItem().getIdentificador();
        List<ChequeCertificadoCompromiso> compromisosActivos = compromisoRepository
                .findByItemIdentificadorAndEstado(itemId, ChequeCertificadoCompromiso.ACTIVO);

        boolean tieneCompromisoGanador = false;
        for (ChequeCertificadoCompromiso compromiso : compromisosActivos) {
            if (compromiso.getPujo() != null && compromiso.getPujo().getIdentificador().equals(pujaGanadora.getIdentificador())) {
                compromiso.setEstado(ChequeCertificadoCompromiso.EJECUTADO);
                tieneCompromisoGanador = true;
            } else {
                compromiso.setEstado(ChequeCertificadoCompromiso.LIBERADO);
            }
            compromisoRepository.save(compromiso);
        }

        if (!tieneCompromisoGanador && obtenerCheque(pujaGanadora.getMetodoPago()) != null) {
            ChequeCertificadoCompromiso compromiso = new ChequeCertificadoCompromiso();
            compromiso.setChequeCertificado(pujaGanadora.getMetodoPago().getChequeCertificado());
            compromiso.setPujo(pujaGanadora);
            compromiso.setItem(pujaGanadora.getItem());
            compromiso.setMonto(pujaGanadora.getImporte());
            compromiso.setEstado(ChequeCertificadoCompromiso.EJECUTADO);
            compromiso.setFechaHora(LocalDateTime.now());
            compromisoRepository.save(compromiso);
        }
    }

    private void liberarCompromisosActivosDelItem(Integer itemId) {
        List<ChequeCertificadoCompromiso> compromisosActivos = compromisoRepository
                .findByItemIdentificadorAndEstado(itemId, ChequeCertificadoCompromiso.ACTIVO);
        for (ChequeCertificadoCompromiso compromiso : compromisosActivos) {
            compromiso.setEstado(ChequeCertificadoCompromiso.LIBERADO);
            compromisoRepository.save(compromiso);
        }
    }

    private ChequeCertificado obtenerCheque(MetodoPago metodoPago) {
        if (metodoPago == null) {
            return null;
        }
        return metodoPago.getChequeCertificado();
    }
}
