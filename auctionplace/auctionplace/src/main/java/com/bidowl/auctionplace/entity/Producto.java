package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(length = 2)
    @Check(constraints = "disponible IN ('si','no')")
    private String disponible;

    @Column(name = "descripcionCatalogo", length = 500)
    private String descripcionCatalogo = "No Posee";

    @Column(name = "descripcionCompleta", length = 300, nullable = false)
    private String descripcionCompleta;

    @ManyToOne(optional = false)
    @JoinColumn(name = "revisor", referencedColumnName = "identificador")
    private Empleado revisor;

    @ManyToOne(optional = false)
    @JoinColumn(name = "duenio", referencedColumnName = "identificador")
    private Duenio duenio;

    @Column(name = "seguro", length = 30)
    private String seguro;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductoImages> fotos;
}