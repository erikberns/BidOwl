package com.bidowl.auctionplace.dto;

import lombok.Data;

@Data
public class RegistroPaso1Request {
    private String email;
    private String contrasena;
    private String documento;
    
    // Front-end step 1 fields
    private String nombre;
    private String apellido;
    private String pais; 
    private String domicilio;
}
