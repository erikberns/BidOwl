package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "duenios")
public class Duenio {
    
    @Id
    @NotNull
    @Column(name = "identificador")
    private Integer identificador;
    
    @Column(name = "numeroPais")
    private Integer numeroPais;
    
    @Column(name = "verificacionFinanciera", length = 2)
    @Pattern(regexp = "si|no", message = "La verificación financiera debe ser 'si' o 'no'")
    private String verificacionFinanciera;
    
    @Column(name = "verificacionJudicial", length = 2)
    @Pattern(regexp = "si|no", message = "La verificación judicial debe ser 'si' o 'no'")
    private String verificacionJudicial;
    
    @Column(name = "calificacionRiesgo")
    @Min(1)
    @Max(6)
    private Integer calificacionRiesgo;
    
    @NotNull
    @Column(name = "verificador")
    private Integer verificador;
    

}
