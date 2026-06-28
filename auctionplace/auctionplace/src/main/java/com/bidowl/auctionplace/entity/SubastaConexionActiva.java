// Registra a que unica subasta se encuentra conectado cada usuario.
package com.bidowl.auctionplace.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subastas_conexiones_activas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubastaConexionActiva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "persona", nullable = false)
    private Persona persona;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sesion")
    private SesionPersona sesion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subasta", nullable = false)
    private Subasta subasta;

    @Column(name = "fecha_conexion", nullable = false)
    private LocalDateTime fechaConexion;

    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    @Column(name = "activa", nullable = false)
    private Boolean activa = true;
}
