package com.bidowl.auctionplace;

import com.bidowl.auctionplace.dto.RegistroPaso1Request;
import com.bidowl.auctionplace.entity.Persona;
import com.bidowl.auctionplace.entity.RegistroPendiente;
import com.bidowl.auctionplace.repository.PersonaRepository;
import com.bidowl.auctionplace.repository.RegistroPendienteRepository;
import com.bidowl.auctionplace.service.PersonaServiceInterface;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AuctionplaceApplicationTests {

    @Autowired
    private PersonaServiceInterface personaService;

    @Autowired
    private PersonaRepository personaRepository;

    @Autowired
    private RegistroPendienteRepository registroPendienteRepository;

    @Test
    void contextLoads() {
    }

    @Test
    @Transactional
    void testFlujoRegistroYValidacionAdministrativa() throws Exception {
        // 1. Paso 1 del Registro
        RegistroPaso1Request paso1 = new RegistroPaso1Request();
        paso1.setNombre("Jose");
        paso1.setApellido("Godio Claudio");
        paso1.setPais("Argentina");
        paso1.setDomicilio("Lima 757");
        paso1.setDocumento("44485742");
        paso1.setEmail("jgodio@uade.edu.ar");
        paso1.setContrasena("temporal123");

        Persona provisional = personaService.registrarPaso1(paso1, null, null);
        assertNotNull(provisional);
        Integer registroId = provisional.getIdentificador();
        assertNotNull(registroId);

        // Verificar que quedó registrado en registros_pendientes con estado PENDIENTE
        RegistroPendiente rp = registroPendienteRepository.findById(registroId).orElse(null);
        assertNotNull(rp);
        assertEquals("PENDIENTE", rp.getEstado());
        assertEquals("Jose", rp.getNombre());
        assertEquals("Godio Claudio", rp.getApellido());
        assertEquals("jgodio@uade.edu.ar", rp.getEmail());

        // Verificar que no se creó en la tabla definitiva de personas
        assertFalse(personaRepository.findByEmail("jgodio@uade.edu.ar").isPresent());

        // 2. Paso 2 del Registro (Completar)
        Persona completada = personaService.completarRegistro(registroId, "44485742", "jgodio@uade.edu.ar", "temporal123");
        assertNotNull(completada);

        // Verificar que el estado del registro pendiente cambió a PENDIENTE_APROBACION
        rp = registroPendienteRepository.findById(registroId).orElse(null);
        assertNotNull(rp);
        assertEquals("PENDIENTE_APROBACION", rp.getEstado());

        // El login todavía debe fallar porque no ha sido aprobado
        Exception loginPendingException = assertThrows(Exception.class, () -> {
            personaService.login("jgodio@uade.edu.ar", "temporal123");
        });
        assertTrue(loginPendingException.getMessage().contains("pendiente de aprobación"));

        // 3. Aprobación Administrativa (Genera contraseña aleatoria de 8 caracteres)
        String contrasenaGenerada = personaService.aprobarRegistro(registroId);
        assertNotNull(contrasenaGenerada);
        assertEquals(8, contrasenaGenerada.length());

        // Verificar que el estado del registro pendiente es APROBADO
        rp = registroPendienteRepository.findById(registroId).orElse(null);
        assertNotNull(rp);
        assertEquals("APROBADO", rp.getEstado());

        // 4. Loguearse con el nuevo perfil (usando la contraseña generada por el admin)
        Persona logueada = personaService.login("jgodio@uade.edu.ar", contrasenaGenerada);
        assertNotNull(logueada);
        assertEquals("Jose", logueada.getNombre());
        assertEquals("Godio Claudio", logueada.getApellido());
        assertEquals("activo", logueada.getEstado());

        // Intentar loguearse con una contraseña incorrecta debe fallar
        assertThrows(Exception.class, () -> {
            personaService.login("jgodio@uade.edu.ar", "wrong_password");
        });

        // 5. Verificar requiereConfiguracion (debe ser true porque la contraseña no ha sido cambiada)
        assertTrue(personaService.requiereConfiguracion(logueada.getIdentificador()));

        // 6. Cambiar contraseña a una nueva personalizada
        personaService.cambiarContrasena(logueada.getIdentificador(), "nuevaContrasenaSuperSegura123");

        // 7. Verificar requiereConfiguracion (debe ser false ahora que cambió la contraseña)
        assertFalse(personaService.requiereConfiguracion(logueada.getIdentificador()));

        // 8. Verificar que el login con la nueva contraseña funciona y con la anterior falla
        Persona logueadaNueva = personaService.login("jgodio@uade.edu.ar", "nuevaContrasenaSuperSegura123");
        assertNotNull(logueadaNueva);

        assertThrows(Exception.class, () -> {
            personaService.login("jgodio@uade.edu.ar", contrasenaGenerada);
        });
    }
}
