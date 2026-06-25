package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "propuestas_comerciales")
@SecondaryTable(name = "propuestas_comerciales_datos_adicionales", pkJoinColumns = @PrimaryKeyJoinColumn(name = "id"))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropuestaComercial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false, unique = true)
    private Producto producto;

    @Column(name = "valor_base", precision = 18, scale = 2, nullable = false)
    private BigDecimal valorBase;

    @Column(name = "comision", precision = 18, scale = 2, nullable = false)
    private BigDecimal comision;

    @Column(name = "ubicacion_subasta", length = 350)
    private String ubicacionSubasta;

    @Column(name = "fecha_estimada")
    private java.time.LocalDate fechaEstimada;

    @Column(name = "estado", length = 50)
    private String estado = "PENDIENTE"; // PENDIENTE, ACEPTADA, RECHAZADA

    @Column(table = "propuestas_comerciales_datos_adicionales", name = "moneda", length = 10, nullable = false)
    private String moneda = "pesos";
}
