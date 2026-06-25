package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "catalogos_fotos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CatalogoFoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalogo", nullable = false)
    private Catalogo catalogo;

    @Lob
    @Column(name = "foto", columnDefinition = "LONGBLOB", nullable = false)
    private byte[] foto;
}
