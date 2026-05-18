package com.bidowl.auctionplace.controllers.bancos;

import com.bidowl.auctionplace.entity.Moneda;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BancoRequest {
    
    private String titularCuenta;
    private String nombreBanco;
    private int idPais;
    private Moneda moneda;
    private String cbuIban;
    private String comprobante;
    private String usuarioId;
}
