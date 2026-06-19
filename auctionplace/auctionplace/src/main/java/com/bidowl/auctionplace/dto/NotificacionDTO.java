package com.bidowl.auctionplace.dto;

import java.time.LocalDateTime;

public class NotificacionDTO {
    private Integer id;
    private String titulo;
    private String tiempoFormateado; // e.g. "Hace 10 Minutos"
    private String body;
    private String buttonText;
    private String action;
    private boolean leida;
    private LocalDateTime fechaOriginal;

    public NotificacionDTO() {}

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getTiempoFormateado() { return tiempoFormateado; }
    public void setTiempoFormateado(String tiempoFormateado) { this.tiempoFormateado = tiempoFormateado; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getButtonText() { return buttonText; }
    public void setButtonText(String buttonText) { this.buttonText = buttonText; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public boolean isLeida() { return leida; }
    public void setLeida(boolean leida) { this.leida = leida; }

    public LocalDateTime getFechaOriginal() { return fechaOriginal; }
    public void setFechaOriginal(LocalDateTime fechaOriginal) { this.fechaOriginal = fechaOriginal; }
}
