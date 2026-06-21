package com.bidowl.auctionplace;

import com.bidowl.auctionplace.dto.*;
import com.bidowl.auctionplace.entity.*;
import com.bidowl.auctionplace.repository.*;
import com.bidowl.auctionplace.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AuctionplaceApplicationTests {

    @Autowired
    private PersonaServiceInterface personaService;

    @Autowired
    private PersonaRepository personaRepository;

    @Autowired
    private RegistroPendienteRepository registroPendienteRepository;

    @Autowired
    private SolicitudProductoService solicitudProductoService;

    @Autowired
    private SubastaService subastaService;

    @Autowired
    private CatalogoService catalogoService;

    @Autowired
    private com.bidowl.auctionplace.service.ItemCatalogoService itemCatalogoService;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private SeguroRepository seguroRepository;

    @Autowired
    private SubastaRepository subastaRepository;

    @Autowired
    private CatalogoRepository catalogoRepository;

    @Autowired
    private ItemCatalogoRepository itemCatalogoRepository;

    @Autowired
    private PujoRepository pujoRepository;

    @Autowired
    private RegistroDeSubastaRepository registroDeSubastaRepository;

    @Autowired
    private MetodoPagoRepository metodoPagoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private DuenioRepository duenioRepository;

    @Autowired
    private SubastadorRepository subastadorRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private PropuestaComercialRepository propuestaComercialRepository;

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

    @Test
    @Transactional
    void testFlujoCompletoEndToEnd() throws Exception {
        // --- 1. REGISTRO Y APROBACIÓN DE DOS USUARIOS ---
        // Vendedor (Dueño)
        RegistroPaso1Request reqVendedor = new RegistroPaso1Request();
        reqVendedor.setNombre("Vendedor");
        reqVendedor.setApellido("De Arte");
        reqVendedor.setPais("Argentina");
        reqVendedor.setDomicilio("San Telmo 123");
        reqVendedor.setDocumento("11111112");
        reqVendedor.setEmail("vendedor.test@bidowl.com");
        reqVendedor.setContrasena("vendedor123");
        
        Persona provVendedor = personaService.registrarPaso1(reqVendedor, null, null);
        assertNotNull(provVendedor);
        Integer idVendedor = provVendedor.getIdentificador();
        personaService.completarRegistro(idVendedor, "11111112", "vendedor.test@bidowl.com", "vendedor123");
        String passVendedor = personaService.aprobarRegistro(idVendedor, "especial");
        Persona logVendedor = personaService.login("vendedor.test@bidowl.com", passVendedor);
        assertNotNull(logVendedor);

        // Comprador (Cliente)
        RegistroPaso1Request reqComprador = new RegistroPaso1Request();
        reqComprador.setNombre("Comprador");
        reqComprador.setApellido("De Arte");
        reqComprador.setPais("Argentina");
        reqComprador.setDomicilio("Palermo 456");
        reqComprador.setDocumento("22222223");
        reqComprador.setEmail("comprador.test@bidowl.com");
        reqComprador.setContrasena("comprador123");
        
        Persona provComprador = personaService.registrarPaso1(reqComprador, null, null);
        assertNotNull(provComprador);
        Integer idComprador = provComprador.getIdentificador();
        personaService.completarRegistro(idComprador, "22222223", "comprador.test@bidowl.com", "comprador123");
        String passComprador = personaService.aprobarRegistro(idComprador, "oro");
        Persona logComprador = personaService.login("comprador.test@bidowl.com", passComprador);
        assertNotNull(logComprador);

        // --- 2. CONFIGURAR MÉTODOS DE PAGO ---
        // Vendedor registra una cuenta bancaria (para recibir transferencias)
        MetodoPago mpVendedor = personaService.registrarCuenta(logVendedor.getIdentificador(), "Vendedor De Arte", "Banco de la Nación", 54, "0110222-333333333333333", "pesos", null);
        assertNotNull(mpVendedor);

        // Comprador registra un cheque certificado de $5,000,000 para pujar
        MetodoPago mpCompradorCheque = personaService.registrarCheque(logComprador.getIdentificador(), "Comprador De Arte", "Banco de Galicia", "CHQ-98765", BigDecimal.valueOf(5000000), 54, "pesos", null);
        assertNotNull(mpCompradorCheque);

        // --- 3. PUBLICACIÓN Y TASACIÓN DE PRODUCTO ---
        // Vendedor envía una propuesta de artículo
        Map<String, Object> resultadoSolicitud = solicitudProductoService.crearSolicitudItem(
            logVendedor.getIdentificador(),
            "Pintura Óleo Quinquela Martín",
            "Obra original del prestigioso pintor Benito Quinquela Martín",
            true,
            "Benito Quinquela Martín",
            LocalDate.of(1950, 5, 10),
            "Comprada directamente al pintor en la Boca",
            true,
            Collections.emptyList()
        );
        assertNotNull(resultadoSolicitud);
        String idSolicitud = resultadoSolicitud.get("idSolicitud").toString();

        // El revisor envía la propuesta comercial: Precio Base $1,000,000 y Comisión 10%
        solicitudProductoService.enviarPropuestaComercial(
            idSolicitud,
            BigDecimal.valueOf(1000000),
            BigDecimal.valueOf(10),
            "La Boca, CABA",
            LocalDate.now().plusDays(15)
        );

        // Vendedor acepta la propuesta comercial y designa su cuenta bancaria para recibir fondos
        Map<String, String> resultadoAceptacion = solicitudProductoService.aceptarPropuesta(
            idSolicitud,
            mpVendedor.getIdentificador().toString()
        );
        assertEquals("ACEPTADO", resultadoAceptacion.get("estado"));

        // Verificar que se creó el Producto y la póliza de Seguro al 110%
        Integer idProducto = Integer.parseInt(idSolicitud);
        Optional<Producto> productoOpt = productoRepository.findById(idProducto);
        assertTrue(productoOpt.isPresent());
        Producto producto = productoOpt.get();
        assertEquals("si", producto.getDisponible());
        assertNotNull(producto.getSeguro());
        
        // Póliza debe ser de $1,100,000 (110% de $1,000,000)
        Seguro seguro = producto.getSeguro();
        assertEquals(BigDecimal.valueOf(1100000).setScale(2), seguro.getImporte().setScale(2));
        assertEquals("La Segunda Cooperativa de Seguros", seguro.getCompania());

        // --- 4. CREAR LA SUBASTA Y ASOCIAR EL CATÁLOGO ---
        // Obtener el subastador y el empleado responsable cargados por el seeder
        Subastador subastadorSeeded = subastadorRepository.findAll().get(0);
        Empleado empleadoSeeded = empleadoRepository.findAll().get(0);

        // Creamos primero el Catálogo/Colección
        CatalogoCrearRequest reqCatalogo = new CatalogoCrearRequest();
        reqCatalogo.setDescripcion("Catálogo de Coleccionistas");
        reqCatalogo.setResponsableId(empleadoSeeded.getIdentificador());

        ItemCatalogoCrearRequest itemReq = new ItemCatalogoCrearRequest();
        itemReq.setProductoId(idProducto);
        // Dejar nulos precio base y comision para que tome los de la propuesta comercial
        reqCatalogo.setItems(Collections.singletonList(itemReq));

        Catalogo catalogo = catalogoService.crearCatalogo(reqCatalogo);
        assertNotNull(catalogo);
        assertNotNull(catalogo.getIdentificador());

        // Creamos la subasta planificada para dentro de 15 días vinculándola al catálogo creado
        SubastaCrearRequest reqSubasta = new SubastaCrearRequest();
        reqSubasta.setTitulo("Gran Subasta de Pinturas del Siglo XX");
        reqSubasta.setDescripcion("Subasta exclusiva de obras selectas");
        reqSubasta.setFecha(LocalDate.now().plusDays(15).toString());
        reqSubasta.setHora("18:00");
        reqSubasta.setUbicacion("Galería de Arte BidOwl");
        reqSubasta.setCapacidadAsistentes(100);
        reqSubasta.setTieneDeposito("si");
        reqSubasta.setSeguridadPropia("si");
        reqSubasta.setCategoria("oro");
        reqSubasta.setSubastadorId(subastadorSeeded.getIdentificador());
        reqSubasta.setResponsableId(empleadoSeeded.getIdentificador());
        reqSubasta.setCatalogoId(catalogo.getIdentificador());

        Subasta subasta = subastaService.crearSubastaConCatalogo(reqSubasta);
        assertNotNull(subasta);
        
        // Abrir la subasta para poder pujar
        subasta.setEstado("abierta");
        subastaRepository.save(subasta);

        // Obtener el ItemCatalogo recién creado
        List<ItemCatalogo> itemsCatalogo = subastaService.obtenerCatalogo(subasta.getIdentificador());
        assertFalse(itemsCatalogo.isEmpty());
        ItemCatalogo itemCatalogo = itemsCatalogo.get(0);
        assertEquals(BigDecimal.valueOf(1000000).setScale(2), itemCatalogo.getPrecioBase().setScale(2));

        // --- 5. COMPRADOR SE UNE A LA SUBASTA Y PUJA ---
        subastaService.unirseASubasta(logComprador.getIdentificador(), subasta.getIdentificador());

        // Intentar pujar con monto mayor al cheque certificado ($6,000,000 > $5,000,000) - Debe Fallar
        Exception excessBidEx = assertThrows(Exception.class, () -> {
            subastaService.crearPuja(subasta.getIdentificador(), itemCatalogo.getIdentificador(), BigDecimal.valueOf(6000000), mpCompradorCheque.getIdentificador().toString(), logComprador.getIdentificador());
        });
        assertTrue(excessBidEx.getMessage().contains("es insuficiente"));

        // Pujar por un valor válido de $2,000,000 - Debe Funcionar
        CrearPujaResponse pujaRes = subastaService.crearPuja(subasta.getIdentificador(), itemCatalogo.getIdentificador(), BigDecimal.valueOf(2000000), mpCompradorCheque.getIdentificador().toString(), logComprador.getIdentificador());
        assertNotNull(pujaRes);
        assertTrue(pujaRes.getExito());

        // --- 6. FINALIZAR LA SUBASTA DE LA OBRA Y GENERAR FACTURA (REGISTRO) ---
        ItemCatalogo itemFinalizado = itemCatalogoService.finalizarSubastaDeItem(itemCatalogo.getIdentificador());
        assertEquals("si", itemFinalizado.getSubastado());

        // Verificar que el registro de subasta (factura) se generó correctamente
        List<RegistroDeSubasta> registros = registroDeSubastaRepository.findAll();
        assertFalse(registros.isEmpty());
        
        // Buscar el registro correspondiente a este producto
        RegistroDeSubasta factura = registros.stream()
            .filter(r -> r.getProducto().getIdentificador().equals(idProducto))
            .findFirst()
            .orElse(null);
        
        assertNotNull(factura);
        assertEquals(logVendedor.getIdentificador(), factura.getDuenio().getIdentificador());
        assertEquals(logComprador.getIdentificador(), factura.getCliente().getIdentificador());
        assertEquals(BigDecimal.valueOf(2000000).setScale(2), factura.getImporte().setScale(2));
        assertEquals(BigDecimal.valueOf(200000).setScale(2), factura.getComision().setScale(2)); // Comisión calculada (10% de $2,000,000)
        assertEquals(mpCompradorCheque.getIdentificador(), factura.getMetodoPago().getIdentificador());
    }

    @Test
    @Transactional
    void testGuardarFotoSubasta() throws Exception {
        Subasta subasta = new Subasta();
        subasta.setHora(java.time.LocalTime.of(12, 0));
        subasta.setTitulo("Subasta Test Foto");
        subasta = subastaRepository.save(subasta);
        
        Empleado empleadoSeeded = empleadoRepository.findAll().get(0);

        Catalogo catalogo = new Catalogo();
        catalogo.setDescripcion("Catalogo Test");
        catalogo.setSubasta(subasta);
        catalogo.setResponsable(empleadoSeeded);
        catalogoRepository.save(catalogo);
        
        byte[] fotoDummy = new byte[]{1, 2, 3, 4, 5};
        Subasta subastaActualizada = subastaService.guardarFotoSubasta(subasta.getIdentificador(), fotoDummy);
        
        assertNotNull(subastaActualizada);
        
        byte[] fotoObtenida = subastaService.obtenerFotoSubastaBytes(subasta.getIdentificador());
        assertArrayEquals(fotoDummy, fotoObtenida);
    }

    @Test
    @Transactional
    void testFlujoCatalogoYSubastaConFotoFallback() throws Exception {
        Empleado empleadoSeeded = empleadoRepository.findAll().get(0);
        
        CatalogoCrearRequest req = new CatalogoCrearRequest();
        req.setDescripcion("Colección de Arte Fallback");
        req.setResponsableId(empleadoSeeded.getIdentificador());
        Catalogo catalogo = catalogoService.crearCatalogo(req);
        
        byte[] fotoCatalogo = new byte[]{10, 20, 30};
        catalogoService.guardarFotoCatalogo(catalogo.getIdentificador(), fotoCatalogo);
        
        SubastaCrearRequest reqSubasta = new SubastaCrearRequest();
        reqSubasta.setTitulo("Subasta Vinculada");
        reqSubasta.setFecha(LocalDate.now().plusDays(15).toString());
        reqSubasta.setHora("12:00");
        reqSubasta.setCatalogoId(catalogo.getIdentificador());
        reqSubasta.setResponsableId(empleadoSeeded.getIdentificador());
        reqSubasta.setSaltarValidacionFecha(true);
        Subasta subasta = subastaService.crearSubastaConCatalogo(reqSubasta);
        
        byte[] fotoObtenida = subastaService.obtenerFotoSubastaBytes(subasta.getIdentificador());
        assertArrayEquals(fotoCatalogo, fotoObtenida);
    }

    @Test
    @Transactional
    void testAutoOpenSubasta() throws Exception {
        Subasta subasta = new Subasta();
        java.time.LocalDateTime inicio = java.time.LocalDateTime.now().minusHours(2);
        subasta.setFecha(inicio.toLocalDate());
        subasta.setHora(inicio.toLocalTime());
        subasta.setEstado("cerrada");
        subasta = subastaRepository.save(subasta);
        
        assertEquals("cerrada", subasta.getEstado());
        
        Subasta subastaRecuperada = subastaService.obtenerPorId(subasta.getIdentificador());
        
        assertEquals("abierta", subastaRecuperada.getEstado());
        
        Subasta subastaEnDb = subastaRepository.findById(subasta.getIdentificador()).orElse(null);
        assertNotNull(subastaEnDb);
        assertEquals("abierta", subastaEnDb.getEstado());
    }

    @Test
    @Transactional
    void testAutoCloseSubasta() throws Exception {
        Subasta subasta = new Subasta();
        java.time.LocalDateTime inicio = java.time.LocalDateTime.now().minusDays(2);
        subasta.setFecha(inicio.toLocalDate());
        subasta.setHora(inicio.toLocalTime());
        subasta.setEstado("cerrada");
        subasta = subastaRepository.save(subasta);
        
        Subasta subastaRecuperada = subastaService.obtenerPorId(subasta.getIdentificador());
        assertEquals("finalizada", subastaRecuperada.getEstado());
    }

    @Test
    @Transactional
    void testMegaPruebaSeeder() {
        for (int i = 1; i <= 10; i++) {
            String email;
            if (i == 1) {
                email = "comprador@bidowl.com";
            } else if (i == 2) {
                email = "vendedor@bidowl.com";
            } else {
                email = "usuario_seeder_" + i + "@bidowl.com";
            }
            
            // Verificamos que el cliente exista y esté admitido
            Optional<Cliente> clienteOpt = clienteRepository.findByEmail(email);
            assertTrue(clienteOpt.isPresent(), "El cliente seeder " + i + " debe existir");
            Cliente cliente = clienteOpt.get();
            assertEquals("si", cliente.getAdmitido());
            
            // Verificamos que sea dueño
            Optional<Duenio> duenioOpt = duenioRepository.findById(cliente.getIdentificador());
            assertTrue(duenioOpt.isPresent(), "El cliente seeder " + i + " debe ser dueño");
            Duenio duenio = duenioOpt.get();
            assertEquals("si", duenio.getVerificacionFinanciera());
            assertEquals("si", duenio.getVerificacionJudicial());
            
            // Verificamos que tenga método de pago
            List<MetodoPago> metodos = metodoPagoRepository.findByPersonaIdentificador(cliente.getIdentificador());
            assertFalse(metodos.isEmpty(), "El cliente seeder " + i + " debe tener un método de pago");
            assertNotNull(metodos.get(0).getTarjetaCredito(), "El método de pago debe tener una tarjeta de crédito");
            
            // Verificamos estadísticas
            assertEquals(2, duenio.getArticulosPublicados(), "El dueño debe tener 2 artículos publicados");
            
            // Verificamos notificaciones
            List<Notificacion> notifs = notificacionRepository.findByPersonaIdOrderByFechaDesc(duenio.getIdentificador());
            assertTrue(notifs.size() >= 3, "El dueño debe tener al menos 3 notificaciones");
            
            boolean tieneRecibida = notifs.stream().anyMatch(n -> n.getTitulo().equals("Solicitud de artículo recibida"));
            boolean tieneRevisada = notifs.stream().anyMatch(n -> n.getTitulo().equals("Su solicitud de artículo publicado fue revisada"));
            boolean tieneAceptada = notifs.stream().anyMatch(n -> n.getTitulo().equals("Artículo aceptado"));
            
            assertTrue(tieneRecibida, "Debe tener notificación de recibido");
            assertTrue(tieneRevisada, "Debe tener notificación de revisado");
            assertTrue(tieneAceptada, "Debe tener notificación de aceptado");
        }
        
        // Verificamos que existan al menos 20 productos creados por los seeders
        List<Producto> productosSeeder = productoRepository.findAll().stream()
            .filter(p -> p.getDuenio().getEmail().contains("usuario_seeder_")
                      || p.getDuenio().getEmail().equals("comprador@bidowl.com")
                      || p.getDuenio().getEmail().equals("vendedor@bidowl.com"))
            .toList();
        assertEquals(20, productosSeeder.size(), "Deben existir exactamente 20 productos de los seeders");
        
        for (Producto prod : productosSeeder) {
            assertEquals("si", prod.getDisponible());
            assertNotNull(prod.getSeguro());
            assertTrue(prod.getSeguro().getNroPoliza().startsWith("POL-SEED-"));
            
            Optional<PropuestaComercial> propOpt = propuestaComercialRepository.findByProducto(prod);
            assertTrue(propOpt.isPresent());
            PropuestaComercial prop = propOpt.get();
            assertEquals("ACEPTADA", prop.getEstado());
            
            // El importe del seguro debe ser 110% de la propuesta base
            BigDecimal esperado = prop.getValorBase().multiply(BigDecimal.valueOf(1.10)).setScale(2, java.math.RoundingMode.HALF_UP);
            assertEquals(esperado, prod.getSeguro().getImporte());
        }
    }
}
