// Representa la deuda, multa, vencimiento y regularizacion de una compra impaga.
package com.bidowl.auctionplace.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "clientes_deudas_subasta")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClienteDeudaSubasta {

    public static final String PENDIENTE = "PENDIENTE";
    public static final String REGULARIZADA = "REGULARIZADA";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "registro_subasta", nullable = false)
    private RegistroDeSubasta registroSubasta;

    @Column(name = "monto_original", precision = 18, scale = 2, nullable = false)
    private BigDecimal montoOriginal;

    @Column(name = "monto_multa", precision = 18, scale = 2, nullable = false)
    private BigDecimal montoMulta;

    @Column(name = "monto_total", precision = 18, scale = 2, nullable = false)
    private BigDecimal montoTotal;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado = PENDIENTE;

    @Column(name = "fecha_generacion", nullable = false)
    private LocalDateTime fechaGeneracion;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDateTime fechaVencimiento;

    @Column(name = "fecha_regularizacion")
    private LocalDateTime fechaRegularizacion;
}
