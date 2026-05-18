package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fotos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductoImages {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @ManyToOne(optional = false)
    @JoinColumn(name = "producto", referencedColumnName = "identificador")
    private Producto producto;

    @Lob
    @Column(name = "foto", nullable = false)
    private byte[] foto;

}