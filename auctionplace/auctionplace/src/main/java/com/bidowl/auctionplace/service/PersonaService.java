package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.dto.RegistroPaso1Request;
import com.bidowl.auctionplace.entity.Persona;
import com.bidowl.auctionplace.repository.PersonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PersonaService implements PersonaServiceInterface {

    @Autowired
    private PersonaRepository personaRepository;

    @Override
    public Persona registrarPaso1(RegistroPaso1Request request, MultipartFile fotoDniFrente, MultipartFile fotoDniDorso) throws Exception {
        
        // Validación de email en caso de que ya se envíe desde el paso 1
        if(request.getEmail() != null && personaRepository.findByEmail(request.getEmail()).isPresent()){
            throw new Exception("El email ya se encuentra registrado");
        }

        Persona nuevaPersona = new Persona();
        
        // Dado que la base de datos exige que el Documento, Contraseña y Email NO SEAN NULOS (y tu front los completará despues),
        // Aquí introduciremos un String provisorio para que SQL no falle el constraint. Se actualizará en el Paso 2/3.
        nuevaPersona.setDocumento(request.getDocumento() != null ? request.getDocumento() : "PENDIENTE-" + System.currentTimeMillis());
        nuevaPersona.setEmail(request.getEmail() != null ? request.getEmail() : "pendiente-" + System.currentTimeMillis() + "@test.com");
        nuevaPersona.setContrasena(request.getContrasena() != null ? request.getContrasena() : "PENDIENTE");

        // Datos del Front End Paso 1
        nuevaPersona.setNombre(request.getNombre());
        nuevaPersona.setApellido(request.getApellido());
        nuevaPersona.setDireccion(request.getDomicilio());
        // Faltaría lógica de "País", por ahora lo guardamos en numeroPais como string vacío o un ID default
        
        nuevaPersona.setEstado("inactivo"); // Inactivo hasta q confirme la totalidad
        nuevaPersona.setCategoria("comun");
        
        // Simular combinacion de bytes de fotos si es un solo array (SQL `foto`)
        if(fotoDniFrente != null && !fotoDniFrente.isEmpty()){
            nuevaPersona.setFoto(fotoDniFrente.getBytes()); // Solo guardamos frente como demo, puedes juntarlos
        }

        return personaRepository.save(nuevaPersona);
    }
}