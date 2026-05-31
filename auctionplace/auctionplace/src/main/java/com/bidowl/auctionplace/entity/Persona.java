package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "personas")
@Inheritance(strategy = InheritanceType.JOINED)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "documento", length = 20, nullable = false)
    private String documento;

    @Column(name = "nombre", length = 150, nullable = false)
    private String nombre;

    @Column(name = "apellido", length = 150)
    private String apellido;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "numeroPais")
    private Pais pais;

    @Column(name = "email", length = 250, nullable = false, unique = true)
    private String email;

    @Column(name = "contrasena", length = 255, nullable = false)
    private String contrasena;

    @Column(name = "direccion", length = 250)
    private String direccion;

    // "activo", "inactivo"
    @Column(name = "estado", length = 15)
    private String estado;

    // "comun", "plata", "oro", "platino", "especial"
    @Column(name = "categoria", length = 10)
    private String categoria;

    @Lob
    @Column(name = "foto", columnDefinition="LONGBLOB")
    private byte[] foto;

    @Column(name = "metodoPago")
    private Integer metodoPago;

    @Column(name = "rematesAsistidos", nullable = false)
    private Integer rematesAsistidos = 0;

    @Column(name = "rematesGanados", nullable = false)
    private Integer rematesGanados = 0;

    @Column(name = "articulosPublicados", nullable = false)
    private Integer articulosPublicados = 0;

    @Column(name = "pujasRealizadas", nullable = false)
    private Integer pujasRealizadas = 0;
}