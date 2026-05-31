package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "itemsCatalogo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemCatalogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "catalogo", nullable = false)
    private Catalogo catalogo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto", nullable = false)
    private Producto producto;

    @Column(name = "precioBase", precision = 18, scale = 2, nullable = false)
    private BigDecimal precioBase;

    @Column(name = "comision", precision = 18, scale = 2, nullable = false)
    private BigDecimal comision;

    @Column(name = "subastado", length = 2)
    private String subastado = "no"; // "si", "no"
}
