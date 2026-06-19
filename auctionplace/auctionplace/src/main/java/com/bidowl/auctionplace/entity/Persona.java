package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "personas")
@SecondaryTables({
    @SecondaryTable(name = "personas_datos_adicionales", pkJoinColumns = @PrimaryKeyJoinColumn(name = "identificador")),
    @SecondaryTable(name = "personas_documentos_fotos", pkJoinColumns = @PrimaryKeyJoinColumn(name = "identificador")),
    @SecondaryTable(name = "personas_estadisticas", pkJoinColumns = @PrimaryKeyJoinColumn(name = "identificador"))
})
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

    @Column(table = "personas_datos_adicionales", name = "apellido", length = 150)
    private String apellido;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(table = "personas_datos_adicionales", name = "numeroPais")
    private Pais pais;

    @Column(table = "personas_datos_adicionales", name = "email", length = 250, nullable = false, unique = true)
    private String email;

    @Column(table = "personas_datos_adicionales", name = "contrasena", length = 255, nullable = false)
    private String contrasena;

    @Column(table = "personas_datos_adicionales", name = "contrasena_cambiada", nullable = false)
    private Boolean contrasenaCambiada = false;

    @Column(name = "direccion", length = 250)
    private String direccion;

    // "activo", "inactivo"
    @Column(name = "estado", length = 15)
    private String estado;

    // "comun", "plata", "oro", "platino", "especial"
    @Column(table = "personas_datos_adicionales", name = "categoria", length = 10)
    private String categoria;

    @Lob
    @Column(name = "foto", columnDefinition="LONGBLOB")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private byte[] foto;

    @Lob
    @Column(table = "personas_documentos_fotos", name = "foto_frente", columnDefinition="LONGBLOB")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private byte[] fotoFrente;

    @Lob
    @Column(table = "personas_documentos_fotos", name = "foto_dorso", columnDefinition="LONGBLOB")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private byte[] fotoDorso;

    @Column(table = "personas_estadisticas", name = "rematesAsistidos", nullable = false)
    private Integer rematesAsistidos = 0;

    @Column(table = "personas_estadisticas", name = "rematesGanados", nullable = false)
    private Integer rematesGanados = 0;

    @Column(table = "personas_estadisticas", name = "articulosPublicados", nullable = false)
    private Integer articulosPublicados = 0;

    @Column(table = "personas_estadisticas", name = "pujasRealizadas", nullable = false)
    private Integer pujasRealizadas = 0;
}