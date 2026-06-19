package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "productos")
@SecondaryTable(name = "productos_datos_adicionales", pkJoinColumns = @PrimaryKeyJoinColumn(name = "identificador"))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "disponible", length = 2)
    private String disponible = "no"; // "si", "no"

    @Column(name = "descripcionCatalogo", length = 500)
    private String descripcionCatalogo = "No Posee";

    @Column(name = "descripcionCompleta", length = 300, nullable = false)
    private String descripcionCompleta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revisor", nullable = false)
    private Empleado revisor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "duenio", nullable = false)
    private Duenio duenio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seguro")
    private Seguro seguro;

    @Column(table = "productos_datos_adicionales", name = "nombre", length = 250, nullable = false)
    private String nombre;

    @Column(table = "productos_datos_adicionales", name = "descripcion", columnDefinition = "VARCHAR(MAX)")
    private String descripcion;
}
