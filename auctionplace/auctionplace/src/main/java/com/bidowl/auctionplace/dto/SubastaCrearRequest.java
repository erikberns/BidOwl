package com.bidowl.auctionplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubastaCrearRequest {
    private String titulo;
    private String descripcion;
    private String fecha; // yyyy-MM-dd
    private String hora;  // HH:mm:ss o HH:mm
    private String ubicacion;
    private String direccionDetallada;
    private Integer capacidadAsistentes;
    private String tieneDeposito;   // "si", "no"
    private String seguridadPropia; // "si", "no"
    private String categoria;       // "comun", "especial", "plata", "oro", "platino"
    private String moneda;          // "pesos", "dolares"
    private Integer subastadorId;
    private Integer responsableId; // Empleado ID (revisor)
    private Integer catalogoId; // Vincular a catálogo/colección existente
    private String fotoBase64;
    private Boolean saltarValidacionFecha;
}
