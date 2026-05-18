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

public class Banco extends MetodoPago{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, name = "titular_cuenta")
    private String titularCuenta;

    @Column(nullable = false, name = "nombre_banco")
    private String nombreBanco;
    
    @Column(nullable = false, name = "id_pais")
    private int idPais;
    
    @Enumerated(EnumType.STRING)
    private Moneda moneda;
    
    @Column(nullable = false, unique = true, name = "cbu_iban")
    private String cbuIban;

    @Column(nullable = false, name = "comprobante")
    private String comprobante;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;
    
}
