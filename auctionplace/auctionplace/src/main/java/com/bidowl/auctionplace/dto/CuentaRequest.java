package com.bidowl.auctionplace.dto;

import java.math.BigDecimal;

public class CuentaRequest {
    private String titularCuenta;
    private String nombreBanco;
    private Integer paisId;
    private String cbuIban;
    private String moneda;
    private BigDecimal limiteMaximo;

    public String getTitularCuenta() {
        return titularCuenta;
    }

    public void setTitularCuenta(String titularCuenta) {
        this.titularCuenta = titularCuenta;
    }

    public String getNombreBanco() {
        return nombreBanco;
    }

    public void setNombreBanco(String nombreBanco) {
        this.nombreBanco = nombreBanco;
    }

    public Integer getPaisId() {
        return paisId;
    }

    public void setPaisId(Integer paisId) {
        this.paisId = paisId;
    }

    public String getCbuIban() {
        return cbuIban;
    }

    public void setCbuIban(String cbuIban) {
        this.cbuIban = cbuIban;
    }

    public String getMoneda() {
        return moneda;
    }

    public void setMoneda(String moneda) {
        this.moneda = moneda;
    }

    public BigDecimal getLimiteMaximo() {
        return limiteMaximo;
    }

    public void setLimiteMaximo(BigDecimal limiteMaximo) {
        this.limiteMaximo = limiteMaximo;
    }
}
