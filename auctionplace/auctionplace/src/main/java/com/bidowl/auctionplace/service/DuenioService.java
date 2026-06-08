package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.dto.DuenioDTO;
import com.bidowl.auctionplace.entity.Duenio;
import com.bidowl.auctionplace.entity.Empleado;
import com.bidowl.auctionplace.entity.Pais;
import com.bidowl.auctionplace.repository.DuenioRepository;
import com.bidowl.auctionplace.repository.EmpleadoRepository;
import com.bidowl.auctionplace.repository.PaisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DuenioService {

    @Autowired
    private DuenioRepository duenioRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private PaisRepository paisRepository;

    public DuenioDTO crearDuenio(DuenioDTO dto) throws Exception {
        Duenio duenio = new Duenio();
        
        // 1. Datos obligatorios de Persona
        duenio.setDocumento(dto.getDocumento() != null ? dto.getDocumento() : "00000000");
        duenio.setNombre(dto.getNombre() != null ? dto.getNombre() : "Dueño de Prueba");
        duenio.setApellido(dto.getApellido() != null ? dto.getApellido() : "BidOwl");
        duenio.setEmail(dto.getEmail() != null ? dto.getEmail() : "duenio" + System.currentTimeMillis() + "@bidowl.com");
        duenio.setContrasena("12345678"); // Contraseña genérica de prueba
        duenio.setDireccion(dto.getDireccion());
        duenio.setEstado("activo");
        duenio.setCategoria("comun");
        
        // Campos de foto en 'personas_documentos_fotos' no pueden ser NULL en SQL, pasamos arrays vacíos
        duenio.setFotoFrente(new byte[0]);
        duenio.setFotoDorso(new byte[0]);
        
        // 2. Datos específicos de Dueño
        if (dto.getNumeroPais() != null) {
            Pais pais = paisRepository.findById(dto.getNumeroPais()).orElse(null);
            duenio.setPais(pais);
            duenio.setPaisDuenio(pais);
        }
        duenio.setVerificacionFinanciera(dto.getVerificacionFinanciera() != null ? dto.getVerificacionFinanciera() : "si");
        duenio.setVerificacionJudicial(dto.getVerificacionJudicial() != null ? dto.getVerificacionJudicial() : "si");
        duenio.setCalificacionRiesgo(dto.getCalificacionRiesgo() != null ? dto.getCalificacionRiesgo() : 1);

        // 3. Asignar Verificador (Empleado) de forma automática para evitar errores
        Empleado verificador = empleadoRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new Exception("No hay empleados en la base de datos para asignar como verificador. Asegúrate de tener al menos un empleado registrado."));
        duenio.setVerificador(verificador);

        Duenio guardado = duenioRepository.save(duenio);
        dto.setIdentificador(guardado.getIdentificador());
        return dto;
    }
}