package com.bidowl.auctionplace.dto;

import java.time.LocalDateTime;

public class HistorialPujaUsuarioDTO {
    private Integer id; // Pujo ID
    private Integer subastaId;
    private String subastaTitle;
    private String articuloTitle;
    private String image;
    private Integer lote;
    private Integer totalLotes;
    private String monto;
    private boolean ganador;
    private String fechaHora;

    public HistorialPujaUsuarioDTO() {}

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getSubastaId() { return subastaId; }
    public void setSubastaId(Integer subastaId) { this.subastaId = subastaId; }

    public String getSubastaTitle() { return subastaTitle; }
    public void setSubastaTitle(String subastaTitle) { this.subastaTitle = subastaTitle; }

    public String getArticuloTitle() { return articuloTitle; }
    public void setArticuloTitle(String articuloTitle) { this.articuloTitle = articuloTitle; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public Integer getLote() { return lote; }
    public void setLote(Integer lote) { this.lote = lote; }

    public Integer getTotalLotes() { return totalLotes; }
    public void setTotalLotes(Integer totalLotes) { this.totalLotes = totalLotes; }

    public String getMonto() { return monto; }
    public void setMonto(String monto) { this.monto = monto; }

    public boolean isGanador() { return ganador; }
    public void setGanador(boolean ganador) { this.ganador = ganador; }

    public String getFechaHora() { return fechaHora; }
    public void setFechaHora(String fechaHora) { this.fechaHora = fechaHora; }
}
