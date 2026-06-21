package com.bidowl.auctionplace.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ItemCatalogoDTO {
    private String iditem;
    private Integer productoId;
    private String nombre;
    private BigDecimal valorBase;
    private String imagen;
    private String duenioNombre;
    private Integer duenioId;
    private String descripcion;
    private String subastado;
}

