package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "registroDeSubasta")
@SecondaryTable(name = "registro_de_subasta_datos_adicionales", pkJoinColumns = @PrimaryKeyJoinColumn(name = "identificador"))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroDeSubasta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subasta", nullable = false)
    private Subasta subasta;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "duenio", nullable = false)
    private Duenio duenio;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(table = "registro_de_subasta_datos_adicionales", name = "metodoPago", nullable = false)
    private MetodoPago metodoPago;

    /**
     * El precio final de adjudicación/compra (monto de la puja ganadora) que el cliente debe pagar por el producto.
     */
    @Column(name = "importe", precision = 18, scale = 2, nullable = false)
    private BigDecimal importe;

    /**
     * El monto de la comisión calculada para la plataforma de subasta basada en el porcentaje de comisión del ítem sobre el importe final de la puja ganadora.
     */
    @Column(name = "comision", precision = 18, scale = 2, nullable = false)
    private BigDecimal comision;
}
