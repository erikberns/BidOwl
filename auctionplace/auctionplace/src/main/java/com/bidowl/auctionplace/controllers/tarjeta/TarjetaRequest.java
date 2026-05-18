package com.bidowl.auctionplace.controllers.tarjeta;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TarjetaRequest {
    
    @NotBlank(message = "El número de tarjeta es requerido")
    @Size(min = 13, max = 19, message = "El número de tarjeta debe tener entre 13 y 19 dígitos")
    private String numeroTarjeta;
    
    @NotBlank(message = "El titular es requerido")
    private String titularTarjeta;
    
    @NotBlank(message = "La fecha de vencimiento es requerida")
    @Pattern(regexp = "^(0[1-9]|1[0-2])/\\d{2}$", message = "Formato debe ser MM/AA")
    private String fechaVencimiento;
    
    @NotBlank(message = "El CVV es requerido")
    @Size(min = 3, max = 4, message = "El CVV debe tener 3 o 4 dígitos")
    private String cvv;
}
