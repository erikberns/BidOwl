package com.bidowl.auctionplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemActivoDTO {

    private String iditem;
    private String nombre;
    private String estado; // EN_DEPOSITO, EN_SUBASTA, VENDIDO
    private String ubicacionDeposito;
    private String polizaSeguro;
}
