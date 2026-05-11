package com.bidowl.auctionplace.controllers.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

/* Con estas anotaciones le indicamos a Spring que esta clase es un controlador REST y que manejara las solicitudes en la ruta /api/v1/auth */
@RestController
@RequestMapping("/auth")

/* Esta anotacion es lo que nos permite aplicar la inyeccion de dependencias */
@RequiredArgsConstructor

public class AuthenticationController {
     /* Realizamos una Inyeccion de Dependencias del servicio de autenticacion */
    private final AuthenticationService service;


    /* Si se quiere registrar, se debe enviar una solicitud POST a /api/v1/auth/register
     * RequestBody pide un RegisterRequest que contenga los datos necesarios para el registro y lo llama "request".
     * ResponseEntity manda el estado 200 OK si el registro se realiza, junto con el AuthenticationResponse que contiene el bearer token.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request) {
                request.setRole(request.getRole());
        return ResponseEntity.ok(service.register(request));
    }

    /* Es muy parecido al anterior, solo que este chequea la base de datos
    
     * Si se quiere logear, se debe enviar una solicitud POST a /api/v1/auth/authenticate
     * RequestBody pide un AuthenticationRequest que contenga los datos necesarios para el login y lo llama "request".
     * ResponseEntity manda el estado 200 OK si el login se realiza, junto con el AuthenticationResponse que contiene el bearer token.
     */
    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request) {

                
        return ResponseEntity.ok(service.authenticate(request));
    }
    
}
