package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "propuestas_comerciales")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropuestaComercial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitud_item_id", nullable = false, unique = true)
    private SolicitudItem solicitudItem;

    @Column(name = "valor_base", precision = 18, scale = 2, nullable = false)
    private BigDecimal valorBase;

    @Column(name = "comision", precision = 18, scale = 2, nullable = false)
    private BigDecimal comision;

    @Column(name = "estado", length = 50)
    private String estado = "PENDIENTE"; // PENDIENTE, ACEPTADA, RECHAZADA
}
