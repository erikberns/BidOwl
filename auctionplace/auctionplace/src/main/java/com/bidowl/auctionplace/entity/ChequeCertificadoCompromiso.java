// Registra cuanto de un cheque queda comprometido por cada puja o lote.
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
@Table(name = "cheques_certificados_compromisos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChequeCertificadoCompromiso {

    public static final String ACTIVO = "ACTIVO";
    public static final String LIBERADO = "LIBERADO";
    public static final String EJECUTADO = "EJECUTADO";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cheque_certificado", nullable = false)
    private ChequeCertificado chequeCertificado;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pujo", nullable = false)
    private Pujo pujo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item", nullable = false)
    private ItemCatalogo item;

    @Column(name = "monto", precision = 18, scale = 2, nullable = false)
    private BigDecimal monto;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado = ACTIVO;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;
}
