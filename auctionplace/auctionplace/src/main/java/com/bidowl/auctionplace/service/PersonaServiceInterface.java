package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.dto.RegistroPaso1Request;
import com.bidowl.auctionplace.entity.Persona;
import com.bidowl.auctionplace.entity.RegistroPendiente;
import org.springframework.web.multipart.MultipartFile;

import com.bidowl.auctionplace.entity.MetodoPago;
import java.math.BigDecimal;
import java.util.List;

public interface PersonaServiceInterface {
    Persona registrarPaso1(RegistroPaso1Request request, MultipartFile fotoDniFrente, MultipartFile fotoDniDorso) throws Exception;
    Persona completarRegistro(Integer id, String documento, String email, String contrasena) throws Exception;
    Persona login(String email, String contrasena) throws Exception;
    Persona obtenerPorId(Integer id) throws Exception;
    MetodoPago registrarTarjeta(Integer personaId, String numero, String titular, String vencimiento, Integer cvv) throws Exception;
    MetodoPago registrarCuenta(Integer personaId, String titular, String banco, Integer paisId, String cbu, String moneda) throws Exception;
    MetodoPago registrarCheque(Integer personaId, String titular, String banco, String numeroCheque, BigDecimal monto, Integer paisId, String moneda) throws Exception;
    String aprobarRegistro(Integer id) throws Exception;
    List<RegistroPendiente> obtenerRegistrosPendientes();
    boolean requiereConfiguracion(Integer id) throws Exception;
    void cambiarContrasena(Integer id, String contrasenaNueva) throws Exception;
    List<com.bidowl.auctionplace.entity.Pais> obtenerPaises() throws Exception;
}