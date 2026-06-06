package com.bidowl.auctionplace.dto;

import lombok.Data;

@Data
public class DuenioDTO {
    private Integer identificador;
    
    // Datos de Persona
    private String documento;
    private String nombre;
    private String apellido;
    private String email;
    private String direccion;
    
    // Datos de Dueño
    private Integer numeroPais;
    private String verificacionFinanciera;
    private String verificacionJudicial;
    private Integer calificacionRiesgo;
    private Integer verificadorId;
}