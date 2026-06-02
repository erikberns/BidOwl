package com.bidowl.auctionplace.controllers;

import com.bidowl.auctionplace.dto.RegistroPaso1Request;
import com.bidowl.auctionplace.entity.Persona;
import com.bidowl.auctionplace.entity.MetodoPago;
import com.bidowl.auctionplace.entity.RegistroPendiente;
import com.bidowl.auctionplace.service.PersonaServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/personas")
@CrossOrigin(origins = "*")
public class PersonaController {

    @Autowired
    private PersonaServiceInterface personaService;

    @PostMapping(value = "/registro/paso1", consumes = { "multipart/form-data" })
    public ResponseEntity<?> registrarPaso1(
            @ModelAttribute RegistroPaso1Request request,
            @RequestParam(value = "fotoFrente", required = false) MultipartFile fotoFrente,
            @RequestParam(value = "fotoDorso", required = false) MultipartFile fotoDorso) {
        Map<String, Object> response = new HashMap<>();
        try {
            Persona guardada = personaService.registrarPaso1(request, fotoFrente, fotoDorso);
            response.put("mensaje", "Paso 1 de registro completado exitosamente.");
            response.put("personaId", guardada.getIdentificador());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/registro/completar")
    public ResponseEntity<?> completarRegistro(@RequestBody CompletarRegistroRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Persona persona = personaService.completarRegistro(
                    request.getIdentificador(),
                    request.getDocumento(),
                    request.getEmail(),
                    request.getContrasena());
            response.put("mensaje", "Registro completado con éxito y cuenta activada.");
            response.put("persona", persona);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/registro/{id}/aprobar")
    public ResponseEntity<?> aprobarRegistro(
            @PathVariable Integer id,
            @RequestHeader(value = "Autorizacion", required = false) String autorizacion) {
        Map<String, Object> response = new HashMap<>();
        try {
            String contrasenaGenerada = personaService.aprobarRegistro(id);
            response.put("mensaje", "Registro aprobado exitosamente.");
            response.put("contrasenaGenerada", contrasenaGenerada);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/registro/pendientes")
    public ResponseEntity<?> obtenerPendientes(
            @RequestHeader(value = "Autorizacion", required = false) String autorizacion) {
        try {
            List<RegistroPendiente> pendientes = personaService.obtenerRegistrosPendientes();
            return ResponseEntity.ok(pendientes);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Persona persona = personaService.login(request.getEmail(), request.getContrasena());
            response.put("mensaje", "Ingreso exitoso.");
            response.put("persona", persona);
            
            boolean requiereConfiguracion = personaService.requiereConfiguracion(persona.getIdentificador());
            response.put("requiereConfiguracion", requiereConfiguracion);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/{id}/cambiar-contrasena")
    public ResponseEntity<?> cambiarContrasena(@PathVariable Integer id, @RequestBody CambiarContrasenaRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            personaService.cambiarContrasena(id, request.getContrasenaNueva());
            response.put("mensaje", "Contraseña cambiada exitosamente.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/paises")
    public ResponseEntity<?> obtenerPaises() {
        Map<String, Object> response = new HashMap<>();
        try {
            return ResponseEntity.ok(personaService.obtenerPaises());
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPersona(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Persona persona = personaService.obtenerPorId(id);
            return ResponseEntity.ok(persona);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/{id}/metodo-pago/tarjeta")
    public ResponseEntity<?> registrarTarjeta(@PathVariable Integer id, @RequestBody TarjetaRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            MetodoPago mp = personaService.registrarTarjeta(
                    id,
                    request.getNumeroTarjeta(),
                    request.getTitularTarjeta(),
                    request.getFechaVencimiento(),
                    request.getCvv());
            response.put("mensaje", "Tarjeta de crédito registrada con éxito.");
            response.put("metodoPago", mp);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{id}/metodo-pago/cuenta")
    public ResponseEntity<?> registrarCuenta(@PathVariable Integer id, @RequestBody CuentaRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            MetodoPago mp = personaService.registrarCuenta(
                    id,
                    request.getTitularCuenta(),
                    request.getNombreBanco(),
                    request.getPaisId(),
                    request.getCbuIban(),
                    request.getMoneda());
            response.put("mensaje", "Cuenta bancaria registrada con éxito.");
            response.put("metodoPago", mp);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{id}/metodo-pago/cheque")
    public ResponseEntity<?> registrarCheque(@PathVariable Integer id, @RequestBody ChequeRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            MetodoPago mp = personaService.registrarCheque(
                    id,
                    request.getTitular(),
                    request.getBancoEmisor(),
                    request.getNumeroCheque(),
                    request.getMonto(),
                    request.getPaisId(),
                    request.getMoneda());
            response.put("mensaje", "Cheque certificado registrado con éxito.");
            response.put("metodoPago", mp);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    // --- Clases DTO internas ---
    public static class CompletarRegistroRequest {
        private Integer identificador;
        private String documento;
        private String email;
        private String contrasena;

        public Integer getIdentificador() {
            return identificador;
        }

        public void setIdentificador(Integer identificador) {
            this.identificador = identificador;
        }

        public String getDocumento() {
            return documento;
        }

        public void setDocumento(String documento) {
            this.documento = documento;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getContrasena() {
            return contrasena;
        }

        public void setContrasena(String contrasena) {
            this.contrasena = contrasena;
        }
    }

    public static class LoginRequest {
        private String email;
        private String contrasena;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getContrasena() {
            return contrasena;
        }

        public void setContrasena(String contrasena) {
            this.contrasena = contrasena;
        }
    }

    public static class TarjetaRequest {
        private String numeroTarjeta;
        private String titularTarjeta;
        private String fechaVencimiento;
        private Integer cvv;

        public String getNumeroTarjeta() {
            return numeroTarjeta;
        }

        public void setNumeroTarjeta(String numeroTarjeta) {
            this.numeroTarjeta = numeroTarjeta;
        }

        public String getTitularTarjeta() {
            return titularTarjeta;
        }

        public void setTitularTarjeta(String titularTarjeta) {
            this.titularTarjeta = titularTarjeta;
        }

        public String getFechaVencimiento() {
            return fechaVencimiento;
        }

        public void setFechaVencimiento(String fechaVencimiento) {
            this.fechaVencimiento = fechaVencimiento;
        }

        public Integer getCvv() {
            return cvv;
        }

        public void setCvv(Integer cvv) {
            this.cvv = cvv;
        }
    }

    public static class CuentaRequest {
        private String titularCuenta;
        private String nombreBanco;
        private Integer paisId;
        private String cbuIban;
        private String moneda;

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
    }

    public static class ChequeRequest {
        private String titular;
        private String bancoEmisor;
        private String numeroCheque;
        private BigDecimal monto;
        private Integer paisId;
        private String moneda;

        public String getTitular() {
            return titular;
        }

        public void setTitular(String titular) {
            this.titular = titular;
        }

        public String getBancoEmisor() {
            return bancoEmisor;
        }

        public void setBancoEmisor(String bancoEmisor) {
            this.bancoEmisor = bancoEmisor;
        }

        public String getNumeroCheque() {
            return numeroCheque;
        }

        public void setNumeroCheque(String numeroCheque) {
            this.numeroCheque = numeroCheque;
        }

        public BigDecimal getMonto() {
            return monto;
        }

        public void setMonto(BigDecimal monto) {
            this.monto = monto;
        }

        public Integer getPaisId() {
            return paisId;
        }

        public void setPaisId(Integer paisId) {
            this.paisId = paisId;
        }

        public String getMoneda() {
            return moneda;
        }

        public void setMoneda(String moneda) {
            this.moneda = moneda;
        }
    }

    public static class CambiarContrasenaRequest {
        private String contrasenaNueva;

        public String getContrasenaNueva() {
            return contrasenaNueva;
        }

        public void setContrasenaNueva(String contrasenaNueva) {
            this.contrasenaNueva = contrasenaNueva;
        }
    }
}