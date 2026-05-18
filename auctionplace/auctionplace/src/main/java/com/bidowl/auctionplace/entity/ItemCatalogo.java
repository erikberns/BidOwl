package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "itemsCatalogo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemCatalogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @ManyToOne(optional = false)
    @JoinColumn(name = "catalogo")
    private Catalogo catalogo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "producto")
    private Producto producto;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal precioBase;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal comision;

    @Enumerated(EnumType.STRING)
    @Column(length = 2)
    private SiNo subastado;
}