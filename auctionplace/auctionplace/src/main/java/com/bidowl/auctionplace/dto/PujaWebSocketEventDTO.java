package com.bidowl.auctionplace.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PujaWebSocketEventDTO {

    public static final String NUEVA_PUJA = "NUEVA_PUJA";
    public static final String ERROR = "ERROR";
    public static final String ITEM_FINALIZADO = "ITEM_FINALIZADO";
    public static final String SUBASTA_CERRADA = "SUBASTA_CERRADA";

    private String tipo;
    private Boolean exito;
    private String mensaje;
    private Integer subastaId;
    private Integer itemId;
    private Integer pujaId;
    private Integer asistenteId;
    private Integer clienteId;
    private Integer numeroPostor;
    private String nombreCliente;
    private BigDecimal importe;
    private String moneda;
    private LocalDateTime fechaHora;
    private LocalDateTime fechaFinPuja;
    private String estadoItem;
    private String estadoSubasta;

    public static PujaWebSocketEventDTO nuevaPuja(Integer subastaId, com.bidowl.auctionplace.entity.Pujo puja, String moneda) {
        PujaWebSocketEventDTO event = new PujaWebSocketEventDTO();
        event.setTipo(NUEVA_PUJA);
        event.setExito(true);
        event.setMensaje("Nueva puja registrada.");
        event.setSubastaId(subastaId);
        if (puja != null) {
            event.setPujaId(puja.getIdentificador());
            event.setImporte(puja.getImporte());
            event.setFechaHora(puja.getFechaHora());
            if (puja.getItem() != null) {
                event.setItemId(puja.getItem().getIdentificador());
                event.setFechaFinPuja(puja.getItem().getFechaFinPuja());
                event.setEstadoItem(puja.getItem().getSubastado());
            }
            if (puja.getAsistente() != null) {
                event.setAsistenteId(puja.getAsistente().getIdentificador());
                event.setNumeroPostor(puja.getAsistente().getNumeroPostor());
                if (puja.getAsistente().getCliente() != null) {
                    event.setClienteId(puja.getAsistente().getCliente().getIdentificador());
                    event.setNombreCliente(puja.getAsistente().getCliente().getNombre());
                }
            }
        }
        event.setMoneda(moneda);
        return event;
    }

    public static PujaWebSocketEventDTO error(Integer subastaId, Integer itemId, Integer asistenteId, Integer clienteId, String mensaje) {
        PujaWebSocketEventDTO event = new PujaWebSocketEventDTO();
        event.setTipo(ERROR);
        event.setExito(false);
        event.setMensaje(mensaje);
        event.setSubastaId(subastaId);
        event.setItemId(itemId);
        event.setAsistenteId(asistenteId);
        event.setClienteId(clienteId);
        return event;
    }

    public static PujaWebSocketEventDTO itemFinalizado(Integer subastaId, com.bidowl.auctionplace.entity.ItemCatalogo item, String mensaje) {
        PujaWebSocketEventDTO event = new PujaWebSocketEventDTO();
        event.setTipo(ITEM_FINALIZADO);
        event.setExito(true);
        event.setMensaje(mensaje);
        event.setSubastaId(subastaId);
        if (item != null) {
            event.setItemId(item.getIdentificador());
            event.setFechaFinPuja(item.getFechaFinPuja());
            event.setEstadoItem(item.getSubastado());
            if (item.getCatalogo() != null && item.getCatalogo().getSubasta() != null) {
                event.setEstadoSubasta(item.getCatalogo().getSubasta().getEstado());
            }
        }
        return event;
    }

    public static PujaWebSocketEventDTO subastaCerrada(Integer subastaId, String mensaje) {
        PujaWebSocketEventDTO event = new PujaWebSocketEventDTO();
        event.setTipo(SUBASTA_CERRADA);
        event.setExito(true);
        event.setMensaje(mensaje);
        event.setSubastaId(subastaId);
        event.setEstadoSubasta("carrada");
        return event;
    }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public Boolean getExito() { return exito; }
    public void setExito(Boolean exito) { this.exito = exito; }
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    public Integer getSubastaId() { return subastaId; }
    public void setSubastaId(Integer subastaId) { this.subastaId = subastaId; }
    public Integer getItemId() { return itemId; }
    public void setItemId(Integer itemId) { this.itemId = itemId; }
    public Integer getPujaId() { return pujaId; }
    public void setPujaId(Integer pujaId) { this.pujaId = pujaId; }
    public Integer getAsistenteId() { return asistenteId; }
    public void setAsistenteId(Integer asistenteId) { this.asistenteId = asistenteId; }
    public Integer getClienteId() { return clienteId; }
    public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }
    public Integer getNumeroPostor() { return numeroPostor; }
    public void setNumeroPostor(Integer numeroPostor) { this.numeroPostor = numeroPostor; }
    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }
    public BigDecimal getImporte() { return importe; }
    public void setImporte(BigDecimal importe) { this.importe = importe; }
    public String getMoneda() { return moneda; }
    public void setMoneda(String moneda) { this.moneda = moneda; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
    public LocalDateTime getFechaFinPuja() { return fechaFinPuja; }
    public void setFechaFinPuja(LocalDateTime fechaFinPuja) { this.fechaFinPuja = fechaFinPuja; }
    public String getEstadoItem() { return estadoItem; }
    public void setEstadoItem(String estadoItem) { this.estadoItem = estadoItem; }
    public String getEstadoSubasta() { return estadoSubasta; }
    public void setEstadoSubasta(String estadoSubasta) { this.estadoSubasta = estadoSubasta; }
}
