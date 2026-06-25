package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "pujos")
@SecondaryTable(name = "pujos_datos_adicionales", pkJoinColumns = @PrimaryKeyJoinColumn(name = "identificador"))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pujo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asistente", nullable = false)
    private Asistente asistente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item", nullable = false)
    private ItemCatalogo item;

    @Column(name = "importe", precision = 18, scale = 2, nullable = false)
    private BigDecimal importe;

    @Column(name = "ganador", length = 2)
    private String ganador = "no"; // "si", "no"

    @Column(table = "pujos_datos_adicionales", name = "fecha_hora")
    private java.time.LocalDateTime fechaHora;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(table = "pujos_datos_adicionales", name = "metodo_pago")
    private MetodoPago metodoPago;
}
