package com.bidowl.auctionplace.dto;

public class MiSubastaDTO {
    private Integer id; // Subasta ID or Item ID
    private String subastaTitle;
    private String image; // URL to image
    private Integer lote;
    private Integer totalLotes;
    private String ubicacion;
    private String articuloTitle;
    private String pujaMaxima; // Formatted

    public MiSubastaDTO() {}

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

    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }

    public String getArticuloTitle() { return articuloTitle; }
    public void setArticuloTitle(String articuloTitle) { this.articuloTitle = articuloTitle; }

    public String getPujaMaxima() { return pujaMaxima; }
    public void setPujaMaxima(String pujaMaxima) { this.pujaMaxima = pujaMaxima; }
}
