package com.bidowl.auctionplace.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bidowl.auctionplace.entity.Cliente;
import com.bidowl.auctionplace.entity.ClienteDeudaSubasta;
import com.bidowl.auctionplace.entity.RegistroDeSubasta;
import com.bidowl.auctionplace.repository.ClienteDeudaSubastaRepository;

@Service
public class ClientePenalizacionService {

    private static final BigDecimal PORCENTAJE_MULTA = new BigDecimal("0.10");
    private static final int HORAS_PLAZO = 72;

    @Autowired
    private ClienteDeudaSubastaRepository deudaRepository;

    @Transactional
    public ClienteDeudaSubasta generarMultaPorFaltaDePago(RegistroDeSubasta registro) {
        if (registro == null || registro.getCliente() == null) {
            throw new IllegalArgumentException("No se pudo identificar el registro o cliente de la deuda.");
        }

        Optional<ClienteDeudaSubasta> deudaExistente = deudaRepository
                .findByRegistroSubastaIdentificadorAndEstado(registro.getIdentificador(), ClienteDeudaSubasta.PENDIENTE);
        if (deudaExistente.isPresent()) {
            return deudaExistente.get();
        }

        BigDecimal montoOriginal = registro.getImporte() != null ? registro.getImporte() : BigDecimal.ZERO;
        BigDecimal montoMulta = montoOriginal.multiply(PORCENTAJE_MULTA).setScale(2, RoundingMode.HALF_UP);
        LocalDateTime ahora = LocalDateTime.now();

        ClienteDeudaSubasta deuda = new ClienteDeudaSubasta();
        deuda.setCliente(registro.getCliente());
        deuda.setRegistroSubasta(registro);
        deuda.setMontoOriginal(montoOriginal);
        deuda.setMontoMulta(montoMulta);
        deuda.setMontoTotal(montoOriginal.add(montoMulta));
        deuda.setEstado(ClienteDeudaSubasta.PENDIENTE);
        deuda.setFechaGeneracion(ahora);
        deuda.setFechaVencimiento(ahora.plusHours(HORAS_PLAZO));
        return deudaRepository.save(deuda);
    }

    public Optional<ClienteDeudaSubasta> obtenerBloqueoActivo(Integer clienteId) {
        if (clienteId == null) {
            return Optional.empty();
        }
        return deudaRepository.findFirstByClienteIdentificadorAndEstadoOrderByFechaGeneracionDesc(
                clienteId, ClienteDeudaSubasta.PENDIENTE);
    }

    public Optional<ClienteDeudaSubasta> obtenerDeudaPendientePorProducto(Integer productoId) {
        if (productoId == null) {
            return Optional.empty();
        }
        return deudaRepository.findFirstByRegistroSubastaProductoIdentificadorAndEstado(
                productoId, ClienteDeudaSubasta.PENDIENTE);
    }

    public void validarClienteSinBloqueo(Integer clienteId) {
        Optional<ClienteDeudaSubasta> deuda = obtenerBloqueoActivo(clienteId);
        if (deuda.isPresent()) {
            ClienteDeudaSubasta bloqueo = deuda.get();
            throw new IllegalStateException("Tu participacion esta suspendida por una deuda pendiente. Debes regularizar "
                    + bloqueo.getMontoTotal() + " antes del " + bloqueo.getFechaVencimiento() + ".");
        }
    }

    @Transactional
    public ClienteDeudaSubasta regularizarDeuda(Integer deudaId, Integer clienteId) {
        ClienteDeudaSubasta deuda = deudaRepository.findById(deudaId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Deuda no encontrada."));
        Cliente cliente = deuda.getCliente();
        if (clienteId != null && cliente != null && !cliente.getIdentificador().equals(clienteId)) {
            throw new IllegalArgumentException("La deuda no pertenece al cliente indicado.");
        }
        deuda.setEstado(ClienteDeudaSubasta.REGULARIZADA);
        deuda.setFechaRegularizacion(LocalDateTime.now());
        return deudaRepository.save(deuda);
    }
}
