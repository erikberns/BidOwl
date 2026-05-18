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
public class Tarjeta extends MetodoPago {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, unique = true, name = "numero_tarjeta")
    private String numeroTarjeta;
    
    @Column(nullable = false, name = "titular_tarjeta")
    private String titularTarjeta;
    
    @Column(nullable = false, name = "fecha_vencimiento")
    private String fechaVencimiento;
    
    @Column(nullable = false, name = "cvv")
    private String cvv;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;
}
