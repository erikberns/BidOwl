package com.bidowl.auctionplace.controllers.cheques;

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
public class ChequeResponse {
    
    private UUID id;
    private String titular;
    private String bancoEmisor;
    private String numeroCheque;
    private float monto;
    private int pais;
    private Moneda moneda;
    private String comprobante;
    private String usuarioId;
    private String mensaje;
}
