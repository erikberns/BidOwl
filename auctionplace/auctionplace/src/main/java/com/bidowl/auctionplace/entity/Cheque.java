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
    
    @Column(nullable = false, name = "titular")
    private String titular;

    @Column(nullable = false, name = "banco_emisor")
    private String bancoEmisor;
    
    @Column(nullable = false, name = "numero_cheque")
    private String numeroCheque;
    
    @Column(nullable = false, name = "monto")
    private float monto;
    
    @Column(nullable = false, name = "pais")
    private int pais;

    @Enumerated(EnumType.STRING)
    private Moneda moneda;

    @Column(nullable = false, name = "comprobante")
    private String comprobante;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;
    
}
