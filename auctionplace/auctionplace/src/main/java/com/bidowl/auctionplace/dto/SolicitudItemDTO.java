package com.bidowl.auctionplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudItemDTO {

    private String idSolicitud;
    private String nombre;
    private String descripcion;
    private Boolean esArteODisenador;
    private String nombreCreador;
    private LocalDate fechaCreacion;
    private String historia;
    private Boolean declaracionPropiedad;
    private String estado;
}
