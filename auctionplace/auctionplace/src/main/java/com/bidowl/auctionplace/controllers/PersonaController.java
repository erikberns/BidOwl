// Gestiona registro, aprobacion, login, perfil, recuperacion y medios de pago.
package com.bidowl.auctionplace.controllers;

import com.bidowl.auctionplace.dto.*;
import com.bidowl.auctionplace.entity.Persona;
import com.bidowl.auctionplace.entity.MetodoPago;
import com.bidowl.auctionplace.entity.RegistroPendiente;
import com.bidowl.auctionplace.entity.SesionPersona;
import com.bidowl.auctionplace.service.PersonaServiceInterface;
import com.bidowl.auctionplace.service.EmailService;
import com.bidowl.auctionplace.service.SesionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/personas")
@CrossOrigin(origins = "*")
public class PersonaController {

    @Autowired
    private PersonaServiceInterface personaService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SesionService sesionService;

    @PostMapping("/enviar-token")
    public ResponseEntity<?> enviarToken(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                throw new Exception("El email es obligatorio.");
            }
            
            String token = String.valueOf((int) (10000 + Math.random() * 90000));
            emailService.enviarTokenVerificacion(email.trim(), token);
            
            response.put("mensaje", "Token enviado exitosamente al correo.");
            response.put("token", token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping(value = "/registro/paso1", consumes = { "multipart/form-data" })
    public ResponseEntity<?> registrarPaso1(
            @ModelAttribute RegistroPaso1Request request,
            @RequestParam(value = "fotoFrente", required = false) MultipartFile fotoFrente,
            @RequestParam(value = "fotoDorso", required = false) MultipartFile fotoDorso) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (fotoFrente == null || fotoFrente.isEmpty()) {
                throw new Exception("La foto de frente del DNI es obligatoria.");
            }
            if (fotoDorso == null || fotoDorso.isEmpty()) {
                throw new Exception("La foto de dorso del DNI es obligatoria.");
            }
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
            @RequestBody(required = false) Map<String, String> requestBody,
            @RequestHeader(value = "Autorizacion", required = false) String autorizacion) {
        Map<String, Object> response = new HashMap<>();
        try {
            String categoria = "COMUN";
            if (requestBody != null && requestBody.containsKey("categoria")) {
                categoria = requestBody.get("categoria");
            }
            if (categoria == null) {
                categoria = "COMUN";
            }
            categoria = categoria.trim().toUpperCase();

            if (!categoria.equals("COMUN") && !categoria.equals("ESPECIAL") && 
                !categoria.equals("PLATA") && !categoria.equals("ORO") && 
                !categoria.equals("PLATINO")) {
                throw new Exception("Categoría inválida. Las categorías permitidas son: COMUN, ESPECIAL, PLATA, ORO, PLATINO.");
            }

            String contrasenaGenerada = personaService.aprobarRegistro(id, categoria.toLowerCase());
            response.put("mensaje", "Registro aprobado exitosamente.");
            response.put("contrasenaGenerada", contrasenaGenerada);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/registro/{id}/rechazar")
    public ResponseEntity<?> rechazarRegistro(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, String> requestBody,
            @RequestHeader(value = "Autorizacion", required = false) String autorizacion) {
        Map<String, Object> response = new HashMap<>();
        try {
            String motivo = "La documentación de identidad provista no es legible o no coincide con los datos ingresados.";
            if (requestBody != null && requestBody.containsKey("motivo")) {
                motivo = requestBody.get("motivo");
            }
            personaService.rechazarRegistro(id, motivo);
            response.put("mensaje", "Registro rechazado exitosamente.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{id}/categoria")
    public ResponseEntity<?> modificarCategoria(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, String> requestBody,
            @RequestHeader(value = "Autorizacion", required = false) String autorizacion) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (requestBody == null || !requestBody.containsKey("categoria")) {
                throw new Exception("La categoría es requerida.");
            }
            String categoria = requestBody.get("categoria");
            if (categoria == null) {
                throw new Exception("La categoría es requerida.");
            }
            categoria = categoria.trim().toUpperCase();

            if (!categoria.equals("COMUN") && !categoria.equals("ESPECIAL") && 
                !categoria.equals("PLATA") && !categoria.equals("ORO") && 
                !categoria.equals("PLATINO")) {
                throw new Exception("Categoría inválida. Las categorías permitidas son: COMUN, ESPECIAL, PLATA, ORO, PLATINO.");
            }

            personaService.modificarCategoria(id, categoria.toLowerCase());
            response.put("mensaje", "Categoría modificada exitosamente.");
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
            SesionPersona sesion = sesionService.crearSesion(persona);
            response.put("mensaje", "Ingreso exitoso.");
            response.put("persona", persona);
            response.put("tokenSesion", sesion.getToken());
            response.put("token", sesion.getToken());
            
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
                    request.getCvv(),
                    request.getLimiteMaximo());
            response.put("mensaje", "Tarjeta de crédito registrada con éxito.");
            response.put("metodoPago", mp);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping(value = "/{id}/metodo-pago/cuenta", consumes = { "multipart/form-data" })
    public ResponseEntity<?> registrarCuenta(
            @PathVariable Integer id,
            @ModelAttribute CuentaRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            MetodoPago mp = personaService.registrarCuenta(
                    id,
                    request.getTitularCuenta(),
                    request.getNombreBanco(),
                    request.getPaisId(),
                    request.getCbuIban(),
                    request.getMoneda(),
                    request.getLimiteMaximo());
            response.put("mensaje", "Cuenta bancaria registrada con éxito.");
            response.put("metodoPagoId", mp.getIdentificador());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping(value = "/{id}/metodo-pago/{metodoPagoId}/cuenta", consumes = { "multipart/form-data" })
    public ResponseEntity<?> actualizarCuenta(
            @PathVariable Integer id,
            @PathVariable Integer metodoPagoId,
            @ModelAttribute CuentaRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            MetodoPago mp = personaService.actualizarCuenta(
                    id,
                    metodoPagoId,
                    request.getTitularCuenta(),
                    request.getNombreBanco(),
                    request.getPaisId(),
                    request.getCbuIban(),
                    request.getMoneda(),
                    request.getLimiteMaximo());
            response.put("mensaje", "Cuenta bancaria actualizada con exito.");
            response.put("metodoPagoId", mp.getIdentificador());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping(value = "/{id}/metodo-pago/cheque", consumes = { "multipart/form-data" })
    public ResponseEntity<?> registrarCheque(
            @PathVariable Integer id,
            @ModelAttribute ChequeRequest request,
            @RequestParam(value = "comprobante", required = false) MultipartFile comprobante) {
        Map<String, Object> response = new HashMap<>();
        try {
            MetodoPago mp = personaService.registrarCheque(
                    id,
                    request.getTitular(),
                    request.getBancoEmisor(),
                    request.getNumeroCheque(),
                    request.getMonto(),
                    request.getPaisId(),
                    request.getMoneda(),
                    request.getLimiteMaximo(),
                    comprobante);
            response.put("mensaje", "Cheque certificado registrado con éxito.");
            response.put("metodoPago", mp);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}/metodos-pago")
    public ResponseEntity<?> obtenerMetodosPago(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<MetodoPago> metodos = personaService.obtenerMetodosPago(id);
            return ResponseEntity.ok(metodos);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}/metodo-pago/{metodoPagoId}/limite")
    public ResponseEntity<?> actualizarLimiteMetodoPago(
            @PathVariable Integer id,
            @PathVariable Integer metodoPagoId,
            @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            Object valor = body.get("limiteMaximo");
            java.math.BigDecimal limite = valor == null || valor.toString().trim().isEmpty()
                    ? null
                    : new java.math.BigDecimal(valor.toString());
            com.bidowl.auctionplace.entity.LimiteMetodoPago guardado =
                    personaService.actualizarLimiteMetodoPago(id, metodoPagoId, limite);
            response.put("mensaje", "Limite actualizado correctamente.");
            response.put("limiteMaximo", guardado != null ? guardado.getLimiteMaximo() : null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/metodo-pago/{metodoPagoId}")
    public ResponseEntity<?> eliminarMetodoPago(@PathVariable Integer metodoPagoId) {
        Map<String, Object> response = new HashMap<>();
        try {
            personaService.eliminarMetodoPago(metodoPagoId);
            response.put("mensaje", "Método de pago eliminado con éxito.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping(value = "/{id}/foto", consumes = { "multipart/form-data" })
    public ResponseEntity<?> subirFotoPerfil(
            @PathVariable Integer id,
            @RequestParam("foto") org.springframework.web.multipart.MultipartFile foto) {
        Map<String, Object> response = new HashMap<>();
        try {
            personaService.subirFotoPerfil(id, foto);
            response.put("mensaje", "Foto de perfil actualizada exitosamente.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> obtenerFotoPerfil(@PathVariable Integer id) {
        try {
            byte[] fotoBytes = personaService.obtenerFotoPerfilBytes(id);
            if (fotoBytes != null && fotoBytes.length > 0) {
                return ControllerSupport.imageResponse(fotoBytes);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean existe = personaService.existeEmail(email);
            response.put("existe", existe);
            boolean contrasenaCambiada = personaService.hasCompletedStage2(email);
            response.put("contrasenaCambiada", contrasenaCambiada);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/recuperar-contrasena")
    public ResponseEntity<?> recuperarContrasena(@RequestBody RecuperarContrasenaRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            personaService.recuperarContrasena(request.getEmail(), request.getContrasenaNueva());
            response.put("mensaje", "Contraseña reestablecida con éxito.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

}
