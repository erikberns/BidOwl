package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "solicitudes_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudItem {

    @Id
    @Column(name = "id", length = 36)
    private String id = UUID.randomUUID().toString();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creador_id", nullable = false)
    private Persona creador;

    @Column(name = "nombre", length = 250, nullable = false)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "es_arte_o_disenador")
    private Boolean esArteODisenador;

    @Column(name = "nombre_creador", length = 250)
    private String nombreCreador;

    @Column(name = "fecha_creacion")
    private LocalDate fechaCreacion;

    @Column(name = "historia", columnDefinition = "TEXT")
    private String historia;

    @Column(name = "declaracion_propiedad")
    private Boolean declaracionPropiedad;

    @Column(name = "estado", length = 50)
    private String estado = "PENDIENTE_REVISION"; // PENDIENTE_REVISION, RECHAZADO, ACEPTADO_INSPECCION, PROPUESTA, ACEPTADO

    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    private String motivoRechazo;

    @Column(name = "ubicacion_deposito", length = 350)
    private String ubicacionDeposito;

    @Column(name = "poliza_seguro", columnDefinition = "LONGTEXT")
    private String polizaSeguro; // URL

    @Column(name = "aceptacion_terminos")
    private Boolean aceptacionTerminos = false;

    @Column(name = "costo_devolucion", precision = 18, scale = 2)
    private java.math.BigDecimal costoDevolucion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuenta_deposito_id")
    private CuentaBancaria cuentaDeposito;

    @Column(name = "fecha_creacion_solicitud")
    private LocalDateTime fechaCreacionSolicitud = LocalDateTime.now();

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    // @OneToOne(mappedBy = "solicitudItem", cascade = CascadeType.ALL)
    // private PropuestaComercial propuestaComercial;
}
