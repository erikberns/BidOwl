package com.bidowl.auctionplace.dto;

import java.math.BigDecimal;

public class PujaActivaDTO {
    private Integer id; // Subasta ID or Item ID
    private String subastaTitle;
    private String image; // URL to image
    private Integer lote;
    private Integer totalLotes;
    private String articuloTitle;
    private String miPuja; // Formatted e.g. "$1,000,000 ARS"
    private String pujaMaxima; // Formatted
    private String estado; // "Activa", "Ganando"

    public PujaActivaDTO() {}

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getSubastaTitle() { return subastaTitle; }
    public void setSubastaTitle(String subastaTitle) { this.subastaTitle = subastaTitle; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public Integer getLote() { return lote; }
    public void setLote(Integer lote) { this.lote = lote; }

    public Integer getTotalLotes() { return totalLotes; }
    public void setTotalLotes(Integer totalLotes) { this.totalLotes = totalLotes; }

    public String getArticuloTitle() { return articuloTitle; }
    public void setArticuloTitle(String articuloTitle) { this.articuloTitle = articuloTitle; }

    public String getMiPuja() { return miPuja; }
    public void setMiPuja(String miPuja) { this.miPuja = miPuja; }

    public String getPujaMaxima() { return pujaMaxima; }
    public void setPujaMaxima(String pujaMaxima) { this.pujaMaxima = pujaMaxima; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
