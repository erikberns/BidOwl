package com.bidowl.auctionplace.controllers.cheques;

import com.bidowl.auctionplace.entity.Moneda;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChequeRequest {
    
    private String titular;
    private String bancoEmisor;
    private String numeroCheque;
    private float monto;
    private int pais;
    private Moneda moneda;
    private String comprobante;
    private String usuarioId;
}
