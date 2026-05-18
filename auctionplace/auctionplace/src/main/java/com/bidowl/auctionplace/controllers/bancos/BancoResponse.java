package com.bidowl.auctionplace.controllers.bancos;

import com.bidowl.auctionplace.entity.Moneda;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BancoResponse {
    
    private UUID id;
    private String titularCuenta;
    private String nombreBanco;
    private int idPais;
    private Moneda moneda;
    private String cbuIban;
    private String comprobante;
    private String usuarioId;
    private String mensaje;
}
