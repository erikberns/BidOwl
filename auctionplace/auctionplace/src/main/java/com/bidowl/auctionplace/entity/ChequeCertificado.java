// Modela los datos y el monto disponible de un cheque certificado.
package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "chequeCertificado")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChequeCertificado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "titular", length = 250, nullable = false)
    private String titular;

    @Column(name = "bancoEmisor", length = 250, nullable = false)
    private String bancoEmisor;

    @Column(name = "numeroCheque", length = 50, nullable = false)
    private String numeroCheque;

    @Column(name = "monto", precision = 18, scale = 2, nullable = false)
    private BigDecimal monto;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pais")
    private Pais pais;

    @Column(name = "moneda", length = 10)
    private String moneda;

    @Lob
    @Column(name = "comprobante", columnDefinition = "LONGBLOB")
    private byte[] comprobante;
}
