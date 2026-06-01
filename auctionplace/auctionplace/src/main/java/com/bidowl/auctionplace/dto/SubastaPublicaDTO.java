package com.bidowl.auctionplace.dto;

import lombok.Data;

@Data
public class SubastaPublicaDTO {
    private String id;
    private String titulo;
    private String fecha;
    private String categoria;
    private Integer cantidaditems;
    private String imagenPortada;
}
