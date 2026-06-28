// Representa el rol de postor con categoria, admision y verificador.
package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "clientes")
@PrimaryKeyJoinColumn(name = "identificador")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Cliente extends Persona {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "numeroPais")
    private Pais paisCliente;

    @Column(name = "admitido", length = 2)
    private String admitido = "no"; // "si", "no"

    @Column(name = "categoria", length = 10)
    private String categoriaCliente = "comun"; // "comun", "especial", "plata", "oro", "platino"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verificador")
    private Empleado verificador;
}
