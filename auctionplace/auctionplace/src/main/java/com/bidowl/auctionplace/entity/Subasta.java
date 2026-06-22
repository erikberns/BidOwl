package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "subastas")
@SecondaryTable(name = "subastas_datos_adicionales", pkJoinColumns = @PrimaryKeyJoinColumn(name = "identificador"))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Subasta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "hora", nullable = false)
    private LocalTime hora;

    @Column(name = "estado", length = 10)
    private String estado = "carrada"; // "abierta", "carrada"

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subastador")
    private Subastador subastador;

    @Column(name = "ubicacion", length = 350)
    private String ubicacion;

    @Column(name = "capacidadAsistentes")
    private Integer capacidadAsistentes;

    @Column(name = "tieneDeposito", length = 2)
    private String tieneDeposito = "no"; // "si", "no"

    @Column(name = "seguridadPropia", length = 2)
    private String seguridadPropia = "no"; // "si", "no"

    @Column(name = "categoria", length = 10)
    private String categoria = "comun"; // "comun", "especial", "plata", "oro", "platino"

    @Column(table = "subastas_datos_adicionales", name = "titulo", length = 250, nullable = false)
    private String titulo;

    @Column(table = "subastas_datos_adicionales", name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;



    @Column(table = "subastas_datos_adicionales", name = "direccion_detallada", length = 350)
    private String direccionDetallada;
}

