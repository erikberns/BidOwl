package com.bidowl.auctionplace.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

/* Con estas anotaciones le indicamos a Spring que esta clase es un servicio
y que se debe crear una instancia de ella cuando sea necesaria */
@Service
@RequiredArgsConstructor

public class AuthenticationService {
    /* Realizamos una Inyeccion de Dependencias del repositorio de usuarios, el generador de tokens, el encoder de contraseñas y el manager de autenticacion */
    private final UsuarioRepository repository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    /* Este metodo se encarga de registrar un nuevo usuario en la base de datos
     * Recibe un RegisterRequest que contiene los datos necesarios para el registro
     * Crea un nuevo usuario con esos datos, encodea la contraseña y le asigna un rol
     * Guarda el usuario en la base de datos y genera un token para ese usuario
     * Devuelve un AuthenticationResponse que contiene el token generado
     */
    public AuthenticationResponse register(RegisterRequest request) {
        var user = Usuario.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();
        repository.save(user);
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    /* Este metodo se encarga de autenticar a un usuario existente en la base de datos
     * Recibe un AuthenticationRequest que contiene los datos necesarios para el login
     * Utiliza el manager de autenticacion para verificar las credenciales del usuario
     * Si las credenciales son correctas, busca al usuario en la base de datos y genera un token para ese usuario
     * Devuelve un AuthenticationResponse que contiene el token generado
     */
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }
}