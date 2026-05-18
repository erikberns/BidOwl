package com.bidowl.auctionplace.entity;

import java.util.UUID;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "tarjetas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)

public class Cheque extends MetodoPago{
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String titular;

    @Column(nullable = false)
    private String bancoEmisor;
    
    @Column(nullable = false)
    private String numeroCheque;
    
    @Column(nullable = false)
    private float monto;
    
    @Column(nullable = false)
    private int pais;

    @Column(nullable = false)
    private Moneda moneda;

    @Column(nullable = false)
    private String comprobante;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;
    
}
