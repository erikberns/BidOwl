package com.bidowl.auctionplace.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ItemCatalogoDTO {
    private String iditem;
    private String nombre;
    private BigDecimal valorBase;
    private String imagen;
    private String duenioNombre;
    private String descripcion;
}
