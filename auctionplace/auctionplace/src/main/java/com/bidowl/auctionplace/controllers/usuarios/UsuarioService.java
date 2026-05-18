package com.bidowl.auctionplace.controllers.usuarios;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bidowl.auctionplace.controllers.metodosPago.MetodoPagoResponse;
import com.bidowl.auctionplace.controllers.tarjetas.TarjetaRequest;
import com.bidowl.auctionplace.entity.Tarjeta;
import com.bidowl.auctionplace.entity.TipoMetodoPago;
import com.bidowl.auctionplace.entity.User;
import com.bidowl.auctionplace.repository.TarjetaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioService {
    
    private final UsuarioRepository usuarioRepository;
    private final TarjetaRepository tarjetaRepository;
    
    public MetodoPagoResponse agregarTarjeta(UUID idUsuario, TarjetaRequest request) {
        
        // Buscar el usuario
        User usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Crear la tarjeta
        Tarjeta tarjeta = Tarjeta.builder()
                .tipo(TipoMetodoPago.TARJETA)
                .numeroTarjeta(request.getNumeroTarjeta())
                .titularTarjeta(request.getTitularTarjeta())
                .fechaVencimiento(request.getFechaVencimiento())
                .cvv(request.getCvv())
                .usuario(usuario)
                .build();
        
        // Guardar tarjeta
        tarjeta = tarjetaRepository.save(tarjeta);
        
        // Extraer últimos 4 dígitos
        String ultimos4 = request.getNumeroTarjeta().substring(
                request.getNumeroTarjeta().length() - 4);
        
        // Retornar response
        return MetodoPagoResponse.builder()
                .idMetodo(tarjeta.getId())
                .tipo(TipoMetodoPago.TARJETA.toString())
                .ultimos4(ultimos4)
                .build();
    }
}
