// Conserva los datos y documentos de una persona mientras espera aprobacion.
package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "registros_pendientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroPendiente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "documento", length = 20)
    private String documento;

    @Column(name = "nombre", length = 150)
    private String nombre;

    @Column(name = "apellido", length = 150)
    private String apellido;

    @Column(name = "email", length = 250)
    private String email;

    @Column(name = "direccion", length = 250)
    private String direccion;

    @Column(name = "pais", length = 150)
    private String pais;

    @Lob
    @Column(name = "foto_frente", columnDefinition = "LONGBLOB")
    private byte[] fotoFrente;

    @Lob
    @Column(name = "foto_dorso", columnDefinition = "LONGBLOB")
    private byte[] fotoDorso;

    // "PENDIENTE", "PENDIENTE_APROBACION", "APROBADO", "RECHAZADO"
    @Column(name = "estado", length = 50)
    private String estado;
}
