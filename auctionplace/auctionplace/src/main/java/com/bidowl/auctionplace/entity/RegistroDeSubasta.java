package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "registroDeSubasta")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegistroDeSubasta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @ManyToOne(optional = false)
    @JoinColumn(name = "subasta")
    private Subasta subasta;

    @ManyToOne(optional = false)
    @JoinColumn(name = "duenio")
    private Duenio duenio;

    @ManyToOne(optional = false)
    @JoinColumn(name = "producto")
    private Producto producto;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente")
    private Cliente cliente;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal importe;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal comision;
}