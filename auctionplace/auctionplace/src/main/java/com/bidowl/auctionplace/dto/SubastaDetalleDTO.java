package com.bidowl.auctionplace.dto;

import lombok.Data;
import java.util.List;

@Data
public class SubastaDetalleDTO {
    private String id;
    private String titulo;
    private String rematador;
    private String ubicacion;
    private String fecha;
    private Integer cantidadTotalitems;
    private List<ItemPreviewDTO> previsualizacionitems;
}
