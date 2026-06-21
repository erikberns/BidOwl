package com.bidowl.auctionplace.dto;

import lombok.Data;
import java.util.List;

@Data
public class SubastaDetalleDTO {
    private String id;
    private String titulo;
    private String descripcion;
    private String imagenPortada;
    private String rematador;
    private String ubicacion;
    private String direccionDetallada;
    private String fecha;
    private String hora;
    private String categoria;
    private String estado;
    private Integer cantidadTotalitems;
    private List<ItemPreviewDTO> previsualizacionitems;
}
