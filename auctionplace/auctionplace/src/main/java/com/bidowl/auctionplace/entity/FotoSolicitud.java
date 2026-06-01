package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "fotos_solicitudes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FotoSolicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitud_item_id", nullable = false)
    private SolicitudItem solicitudItem;

    @Column(name = "foto", columnDefinition = "LONGBLOB", nullable = false)
    private byte[] foto;

    @Column(name = "nombre_archivo", length = 250)
    private String nombreArchivo;

    @Column(name = "tipo_mime", length = 50)
    private String tipoMime;
}
