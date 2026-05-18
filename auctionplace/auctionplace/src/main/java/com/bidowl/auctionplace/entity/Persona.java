package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "personas")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @Column(nullable = false, length = 20)
    private String documento;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 250)
    private String direccion;

    @Enumerated(EnumType.STRING)
    @Column(length = 15)
    private Estado estado;

    @Lob
    private byte[] foto;
}