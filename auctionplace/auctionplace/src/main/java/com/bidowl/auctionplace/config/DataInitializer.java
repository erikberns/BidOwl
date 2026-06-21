package com.bidowl.auctionplace.config;

import com.bidowl.auctionplace.entity.*;
import com.bidowl.auctionplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final String[][] NOMBRES_USUARIOS = {
        {"Ricardo", "Darín"},
        {"Guillermo", "Francella"},
        {"Valeria", "Bertuccelli"},
        {"Adrián", "Suar"},
        {"Cecilia", "Roth"},
        {"Leonardo", "Sbaraglia"},
        {"Natalia", "Oreiro"},
        {"Mercedes", "Morán"},
        {"Daniel", "Hendler"},
        {"Erica", "Rivas"}
    };

    private static final String[] TITULOS_PRODUCTOS = {
        "Pintura al Óleo de Benito Quinquela Martín",
        "Moneda de Oro Escudo de la Confederación Argentina (1842)",
        "Guitarra Eléctrica Gibson Les Paul Custom (1968)",
        "Reloj de Bolsillo Patek Philippe en Oro 18K",
        "Cámara Leica M3 con Lente Summicron 50mm",
        "Jarrón de Porcelana de la Dinastía Ming",
        "Primera Edición Firmada de 'Ficciones' de Jorge Luis Borges",
        "Cáliz de Plata Cincelada del Siglo XVIII",
        "Escultura de Bronce de Auguste Rodin",
        "Estilográfica Montblanc Meisterstück Solid Gold 149",
        "Sable Militar de Oficial de la Guerra de Independencia",
        "Mapa Cartográfico del Virreinato del Río de la Plata (1780)",
        "Mesa Auxiliar de Estilo Luis XV en Madera de Nogal",
        "Autógrafo Enmarcado de Albert Einstein (1930)",
        "Álbum 'Abbey Road' de The Beatles (Edición Japonesa 1969)",
        "Tapiz Flamenco Tejido a Mano del Siglo XVII",
        "Lupa de Escritorio con Mango de Marfil y Plata",
        "Acuarela de Florencio Molina Campos",
        "Vaso de Cristal de Murano Firmado por Seguso (1950)",
        "Medalla de Honor de los Juegos Olímpicos de Atenas 1896"
    };

    private static final String[] DESCRIPCIONES_PRODUCTOS = {
        "Obra maestra original en óleo titulada 'Día de Sol en La Boca', fechada en el año 1945. La pieza retrata de manera magistral la febril actividad del puerto de Buenos Aires, con sus características embarcaciones, trabajadores portuarios cargando carbón y una paleta de colores vibrantes y empastes gruesos característicos de su estilo. Enmarcada en madera dorada de época y conservada en excelente estado.",
        "Moneda de oro de 8 Escudos sumamente escasa y codiciada, acuñada en la ceca de La Rioja durante el mandato de Juan Manuel de Rosas. Presenta el escudo de armas de la Confederación en el anverso con la leyenda 'Eterno Amor a la Patria' y el sol radiante en el reverso. Posee una pátina natural inalterada y una conservación certificada de grado superior (MS62).",
        "Instrumento vintage de alta gama de la mítica 'era de transición' de Gibson. Cuerpo de caoba de una sola pieza con tapa de arce y diapasón de ébano con incrustaciones de bloque de nácar. Equipada con pastillas humbucker patentadas originales y herrajes dorados que muestran un desgaste natural por el paso de las décadas. Incluye estuche rígido original de felpa amarilla.",
        "Cronómetro de bolsillo suizo de manufactura exclusiva de finales del siglo XIX. Caja de oro amarillo macizo cincelada con monograma floral en la tapa trasera. Esfera de esmalte blanco con números romanos y segundero subsidiario. Cuenta con movimiento de escape de áncora de precisión y muelle espiral Breguet, completamente limpio y en funcionamiento.",
        "Cámara telemétrica alemana clásica fabricada en 1954, considerada el pináculo del diseño mecánico fotográfico. Conserva su revestimiento vulcanizado original en perfectas condiciones y el telémetro de doble imagen perfectamente alineado y contrastado. Viene equipada con el legendario lente colapsable Summicron 50mm f/2 libre de marcas o depósitos de hongos.",
        "Excepcional jarrón de porcelana azul y blanca que data del período del emperador Wanli. Decoración pintada a mano con óxido de cobalto representando dragones de cinco garras persiguiendo la perla flamígera entre nubes propicias. Cuenta con un informe completo de termoluminiscencia y análisis de autenticidad de laboratorio especializado.",
        "Ejemplar histórico de la primera edición publicada por la Editorial Sur en Buenos Aires en 1944. Esta obra fundacional de la literatura fantástica en español cuenta con una dedicatoria del puño y letra de Borges en la primera hoja en blanco, dirigida a un colega escritor. Encuadernación rústica original conservada bajo estuche de conservación libre de ácido.",
        "Pieza de orfebrería sacra elaborada en plata maciza labrada de origen altoperuano. Su diseño barroco tardío presenta un pie lobulado decorado con querubines y hojas de acanto repujadas y cinceladas a mano, con una copa dorada al fuego en su interior. Excelente peso y marcas de platero virreinal visibles en la base.",
        "Escultura numerada y autorizada fundida en bronce patinado verde oscuro titulada 'El Pensador'. Producida a partir de los moldes originales del Museo Rodin con sello de la fundición Alexis Rudier y certificado de procedencia. Muestra un extraordinario nivel de detalle en la tensión muscular y la expresión intelectual de la figura.",
        "Pluma estilográfica de edición limitada fabricada en oro amarillo macizo de 18 quilates. Presenta el clásico diseño facetado con incrustaciones de nácar en la estrella del capuchón y un plumín bicolor de oro de 18K grabado con motivos ornamentales del año 1996. Se entrega con su estuche original de madera noble y tintero de cristal tallado.",
        "Espada histórica de caballería de principios del siglo XIX. Hoja de acero toledano grabada con motivos florales y la inscripción 'No me saques sin razón ni me envaines sin honor'. La empuñadura presenta un guardamano de bronce dorado finamente labrado con cabeza de león y un puño recubierto de cuero con torzal de plata.",
        "Mapa calcográfico grabado en placa de cobre e iluminado a mano en la época por el cartógrafo real don Juan de la Cruz Cano y Olmedilla. Detalla de manera precisa los límites fluviales, misiones jesuíticas y rutas de postas del virreinato, montado sobre soporte de tela de lino original para su conservación.",
        "Mueble antiguo francés del siglo XVIII elaborado en nogal con una intrincada marquetería de maderas frutales. Posee tres cajones frontales con tiradores de bronce rococó originales y patas cabriolé terminadas en sabots de bronce dorado. Barniz original a la muñeca que resalta la veta natural de la madera.",
        "Carta mecanografiada original en alemán sobre papel con membrete del Instituto Kaiser Wilhelm de Berlín, firmada a mano con tinta estilográfica negra por Albert Einstein. El texto discute brevemente cuestiones sobre la teoría del campo unificado. Montada profesionalmente en paspartú libre de ácido con vidrio protector UV.",
        "Prensaje original japonés en vinilo rojo translúcido de alta fidelidad, conocido por su calidad de audio superior. Incluye la mítica faja publicitaria OBI de color verde oliva en perfecto estado de conservación y el encarte original con las letras traducidas. Disco sin rayas y tapa laminada impecable.",
        "Gran tapiz tejido en Bruselas con escenas mitológicas rodeadas por una amplia orla de flores y frutos. Confeccionado con hilos de lana de oveja y seda natural teñidos con pigmentos vegetales de la época. Conserva una notable vivacidad de coloración en los tonos azules y dorados.",
        "Objeto de escritorio de la época victoriana fabricado en Londres en 1892. El mango está hecho de colmillo de marfil tallado a mano con motivos espirales y virola de plata esterlina con marcas de contraste de platero verificadas. Lente de cristal óptico original de alto aumento sin rayaduras.",
        "Pintura original en acuarela sobre papel que representa a dos gauchos conversando en una pulpería campestre, caracterizada por la exageración caricaturesca de los personajes y sus caballos. Firmada y fechada en 1938 en el ángulo inferior derecho, presentada en marco de madera rústica.",
        "Pieza única de vidrio soplado italiano elaborada mediante la técnica de 'sommerso', alternando capas de cristal de color azul cobalto y ámbar. El cuerpo del jarrón posee burbujas controladas en su interior y la firma incisa 'Seguso Murano' grabada con punta de diamante en la base.",
        "Excepcional medalla oficial conmemorativa de bronce diseñada por el escultor francés Chaplain para la primera olimpiada moderna. En el anverso figura el rostro de Zeus sosteniendo a la Victoria alada, y en el reverso la Acrópolis de Atenas. Excelente conservación con estuche de presentación."
    };

    @Autowired
    private PaisRepository paisRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private SectorRepository sectorRepository;

    @Autowired
    private SubastadorRepository subastadorRepository;

    @Autowired
    private RegistroPendienteRepository registroPendienteRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private TarjetaCreditoRepository tarjetaCreditoRepository;

    @Autowired
    private CuentaBancariaRepository cuentaBancariaRepository;

    @Autowired
    private MetodoPagoRepository metodoPagoRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private PropuestaComercialRepository propuestaComercialRepository;

    @Autowired
    private SeguroRepository seguroRepository;

    @Autowired
    private FotoRepository fotoRepository;

    @Autowired
    private PersonaRepository personaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private DuenioRepository duenioRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public void run(String... args) throws Exception {
        // Resetear la base de datos para crear el seeder limpio desde 0
        try {
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
            jdbcTemplate.execute("TRUNCATE TABLE notificaciones");
            jdbcTemplate.execute("TRUNCATE TABLE registro_de_subasta_datos_adicionales");
            jdbcTemplate.execute("TRUNCATE TABLE registroDeSubasta");
            jdbcTemplate.execute("TRUNCATE TABLE pujos");
            jdbcTemplate.execute("TRUNCATE TABLE asistentes");
            jdbcTemplate.execute("TRUNCATE TABLE items_catalogo_datos_adicionales");
            jdbcTemplate.execute("TRUNCATE TABLE itemsCatalogo");
            jdbcTemplate.execute("TRUNCATE TABLE catalogos");
            jdbcTemplate.execute("TRUNCATE TABLE subastas_datos_adicionales");
            jdbcTemplate.execute("TRUNCATE TABLE subastas");
            jdbcTemplate.execute("TRUNCATE TABLE fotos");
            jdbcTemplate.execute("TRUNCATE TABLE propuestas_comerciales");
            jdbcTemplate.execute("TRUNCATE TABLE productos_datos_adicionales");
            jdbcTemplate.execute("TRUNCATE TABLE productos");
            jdbcTemplate.execute("TRUNCATE TABLE seguros");
            jdbcTemplate.execute("TRUNCATE TABLE metodoPago");
            jdbcTemplate.execute("TRUNCATE TABLE tarjetaCredito");
            jdbcTemplate.execute("TRUNCATE TABLE cuentaBancaria");
            jdbcTemplate.execute("TRUNCATE TABLE duenios");
            jdbcTemplate.execute("TRUNCATE TABLE clientes");
            jdbcTemplate.execute("TRUNCATE TABLE subastadores");
            jdbcTemplate.execute("TRUNCATE TABLE empleados");
            jdbcTemplate.execute("TRUNCATE TABLE personas_datos_adicionales");
            jdbcTemplate.execute("TRUNCATE TABLE personas_documentos_fotos");
            jdbcTemplate.execute("TRUNCATE TABLE personas_estadisticas");
            jdbcTemplate.execute("TRUNCATE TABLE personas");
            jdbcTemplate.execute("TRUNCATE TABLE registros_pendientes");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            System.out.println("[DataInitializer] Base de datos limpiada con éxito.");
        } catch (Exception e) {
            System.err.println("[DataInitializer] Error al limpiar base de datos: " + e.getMessage());
        }

        // Cargar recursos de imágenes locales
        byte[] avatarBytes = null;
        try {
            var resourceStream = getClass().getResourceAsStream("/auctioneer_avatar.png");
            if (resourceStream != null) {
                avatarBytes = resourceStream.readAllBytes();
            }
        } catch (Exception e) {
            System.err.println("[DataInitializer] Error al cargar recursos de imágenes: " + e.getMessage());
        }

        // 1. Inicializar Países
        if (paisRepository.count() == 0) {
            Pais argentina = new Pais(54, "Argentina", "ARG", "Buenos Aires", "Argentina", "Español");
            Pais uruguay = new Pais(598, "Uruguay", "URY", "Montevideo", "Uruguaya", "Español");
            Pais brasil = new Pais(55, "Brasil", "BRA", "Brasilia", "Brasileña", "Portugués");
            Pais chile = new Pais(56, "Chile", "CHL", "Santiago", "Chilena", "Español");
            Pais paraguay = new Pais(595, "Paraguay", "PRY", "Asunción", "Paraguaya", "Español");
            Pais bolivia = new Pais(591, "Bolivia", "BOL", "Sucre", "Boliviana", "Español");
            Pais peru = new Pais(51, "Perú", "PER", "Lima", "Peruana", "Español");
            Pais colombia = new Pais(57, "Colombia", "COL", "Bogotá", "Colombiana", "Español");
            Pais ecuador = new Pais(593, "Ecuador", "ECU", "Quito", "Ecuatoriana", "Español");
            Pais venezuela = new Pais(58, "Venezuela", "VEN", "Caracas", "Venezolana", "Español");
            Pais espana = new Pais(34, "España", "ESP", "Madrid", "Española", "Español");
            Pais usa = new Pais(1, "Estados Unidos", "USA", "Washington D.C.", "Estadounidense", "Inglés");
            Pais mexico = new Pais(52, "México", "MEX", "Ciudad de México", "Mexicana", "Español");

            paisRepository.saveAll(Arrays.asList(
                argentina, uruguay, brasil, chile, paraguay, bolivia,
                peru, colombia, ecuador, venezuela, espana, usa, mexico
            ));
        }

        Pais paisDefault = paisRepository.findById(54).orElse(null);

        // 1.5 Inicializar Sectores
        if (sectorRepository.count() == 0) {
            Sector inspeccion = new Sector();
            inspeccion.setNombreSector("Inspección Física de Bienes");
            inspeccion.setCodigoSector("INSP");
            sectorRepository.save(inspeccion);

            Sector catalogosSector = new Sector();
            catalogosSector.setNombreSector("Catálogos y Tasación");
            catalogosSector.setCodigoSector("CAT");
            sectorRepository.save(catalogosSector);
        }

        Sector sectorInspeccion = sectorRepository.findAll().stream()
                .filter(s -> "INSP".equals(s.getCodigoSector()))
                .findFirst()
                .orElse(null);

        // 2. Inicializar Empleado por Defecto (Verificador / Revisor)
        if (empleadoRepository.count() == 0) {
            RegistroPendiente rp = new RegistroPendiente();
            rp.setDocumento("30123456");
            rp.setNombre("Martín");
            rp.setApellido("Palermo");
            rp.setEmail("martin.verificador@bidowl.com");
            rp.setDireccion("Av. Figueroa Alcorta 1234");
            rp.setPais(paisDefault != null ? paisDefault.getNombre() : "Argentina");
            rp.setFotoFrente(avatarBytes);
            rp.setFotoDorso(avatarBytes);
            rp.setEstado("APROBADO");
            registroPendienteRepository.save(rp);

            Empleado empleado = new Empleado();
            empleado.setNombre("Martín");
            empleado.setApellido("Palermo");
            empleado.setDocumento("30123456");
            empleado.setEmail("martin.verificador@bidowl.com");
            empleado.setContrasena("palermo123");
            empleado.setContrasenaCambiada(true); // Simular cambio de contraseña realizado
            empleado.setDireccion("Av. Figueroa Alcorta 1234");
            empleado.setEstado("activo");
            empleado.setCategoria("especial");
            empleado.setPais(paisDefault);
            empleado.setCargo("Revisor Senior de Coleccionables");
            empleado.setSector(sectorInspeccion != null ? sectorInspeccion.getIdentificador() : 1);
            empleado.setFoto(avatarBytes);
            empleado.setFotoFrente(avatarBytes);
            empleado.setFotoDorso(avatarBytes);
            empleado.setRematesAsistidos(0);
            empleado.setRematesGanados(0);
            empleado.setArticulosPublicados(0);
            empleado.setPujasRealizadas(0);
            empleadoRepository.save(empleado);
        }

        // 4. Inicializar Subastador por Defecto (Agustin Blanco Vocos)
        if (subastadorRepository.count() == 0) {
            RegistroPendiente rp = new RegistroPendiente();
            rp.setDocumento("22111333");
            rp.setNombre("Agustin");
            rp.setApellido("Blanco Vocos");
            rp.setEmail("jorge.subastas@bidowl.com");
            rp.setDireccion("Av. Cabildo 2200");
            rp.setPais(paisDefault != null ? paisDefault.getNombre() : "Argentina");
            rp.setFotoFrente(avatarBytes);
            rp.setFotoDorso(avatarBytes);
            rp.setEstado("APROBADO");
            registroPendienteRepository.save(rp);

            Subastador subastador = new Subastador();
            subastador.setNombre("Agustin");
            subastador.setApellido("Blanco Vocos");
            subastador.setDocumento("22111333");
            subastador.setEmail("jorge.subastas@bidowl.com");
            subastador.setContrasena("martillero123");
            subastador.setContrasenaCambiada(true); // Simular cambio de contraseña realizado
            subastador.setDireccion("Av. Cabildo 2200");
            subastador.setEstado("activo");
            subastador.setCategoria("platino");
            subastador.setPais(paisDefault);
            subastador.setMatricula("MAT-8947-C");
            subastador.setRegion("Buenos Aires");
            subastador.setFoto(avatarBytes);
            subastador.setFotoFrente(avatarBytes);
            subastador.setFotoDorso(avatarBytes);
            subastador.setRematesAsistidos(0);
            subastador.setRematesGanados(0);
            subastador.setArticulosPublicados(0);
            subastador.setPujasRealizadas(0);
            subastadorRepository.save(subastador);
        }

        // 5. Clientes de Prueba (Comprador y Vendedor inicializados en bucle más abajo)

        // Asegurar que Martín Palermo (ID 1) sea cliente y tenga método de pago
        if (jdbcTemplate.queryForObject("SELECT count(*) FROM clientes WHERE identificador = 1", Integer.class) == 0) {
            jdbcTemplate.update("INSERT INTO clientes (identificador, numeroPais, admitido, categoria, verificador) VALUES (1, 54, 'si', 'platino', 1)");
            
            // Tarjeta de Crédito para Martín Palermo
            TarjetaCredito tc1 = new TarjetaCredito();
            tc1.setNumeroTarjeta("4532-1111-2222-1111");
            tc1.setTitularTarjeta("Martín Palermo");
            tc1.setFechaVencimiento("12/30");
            tc1.setCvv(999);
            tarjetaCreditoRepository.save(tc1);

            // Método de Pago
            MetodoPago mp1 = new MetodoPago();
            Persona p1 = new Persona();
            p1.setIdentificador(1);
            mp1.setPersona(p1);
            mp1.setTarjetaCredito(tc1);
            metodoPagoRepository.save(mp1);
        }

        // Asegurar que Agustin Blanco Vocos (ID 2) sea cliente y tenga método de pago
        if (jdbcTemplate.queryForObject("SELECT count(*) FROM clientes WHERE identificador = 2", Integer.class) == 0) {
            jdbcTemplate.update("INSERT INTO clientes (identificador, numeroPais, admitido, categoria, verificador) VALUES (2, 54, 'si', 'platino', 1)");
            
            // Tarjeta de Crédito para Agustin Blanco Vocos
            TarjetaCredito tc2 = new TarjetaCredito();
            tc2.setNumeroTarjeta("4532-1111-2222-2222");
            tc2.setTitularTarjeta("Agustin Blanco Vocos");
            tc2.setFechaVencimiento("12/30");
            tc2.setCvv(888);
            tarjetaCreditoRepository.save(tc2);

            // Método de Pago
            MetodoPago mp2 = new MetodoPago();
            Persona p2 = new Persona();
            p2.setIdentificador(2);
            mp2.setPersona(p2);
            mp2.setTarjetaCredito(tc2);
            metodoPagoRepository.save(mp2);
        }

        // MEGA PRUEBA: Inicializar al menos 10 usuarios completamente registrados y 20 productos aceptados distribuidos entre ellos.
        Empleado martinRevisor = empleadoRepository.findAll().stream().findFirst().orElse(null);
        if (martinRevisor == null) {
            throw new IllegalStateException("Martín Palermo (verificador) no existe en la base de datos");
        }

        if (clienteRepository.findByEmail("comprador@bidowl.com").isEmpty()) {
            java.util.Random random = new java.util.Random();
            for (int i = 1; i <= 10; i++) {
                String email;
                String doc;
                String nombre = NOMBRES_USUARIOS[i - 1][0];
                String apellido = NOMBRES_USUARIOS[i - 1][1];
                
                if (i == 1) {
                    email = "comprador@bidowl.com";
                    doc = "22222222";
                } else if (i == 2) {
                    email = "vendedor@bidowl.com";
                    doc = "11111111";
                } else {
                    email = "usuario_seeder_" + i + "@bidowl.com";
                    doc = "444444" + String.format("%02d", i);
                }
                
                // 1. Registro Pendiente Aprobado
                RegistroPendiente rp = new RegistroPendiente();
                rp.setDocumento(doc);
                rp.setNombre(nombre);
                rp.setApellido(apellido);
                rp.setEmail(email);
                if (i == 1) {
                    rp.setDireccion("Palermo 456");
                } else if (i == 2) {
                    rp.setDireccion("San Telmo 123");
                } else {
                    rp.setDireccion("Calle Seeder " + i);
                }
                rp.setPais(paisDefault != null ? paisDefault.getNombre() : "Argentina");
                rp.setFotoFrente(avatarBytes);
                rp.setFotoDorso(avatarBytes);
                rp.setEstado("APROBADO");
                registroPendienteRepository.save(rp);

                // 2. Cliente
                Cliente cliente = new Cliente();
                cliente.setNombre(nombre);
                cliente.setApellido(apellido);
                cliente.setDocumento(doc);
                cliente.setEmail(email);
                if (i == 1) {
                    cliente.setContrasena("comprador123");
                    cliente.setDireccion("Palermo 456");
                    cliente.setCategoria("oro");
                    cliente.setCategoriaCliente("oro");
                } else if (i == 2) {
                    cliente.setContrasena("vendedor123");
                    cliente.setDireccion("San Telmo 123");
                    cliente.setCategoria("especial");
                    cliente.setCategoriaCliente("especial");
                } else {
                    cliente.setContrasena("usuario123");
                    cliente.setDireccion("Calle Seeder " + i);
                    cliente.setCategoria("oro");
                    cliente.setCategoriaCliente("oro");
                }
                cliente.setContrasenaCambiada(true);
                cliente.setEstado("activo");
                cliente.setFoto(avatarBytes);
                cliente.setFotoFrente(avatarBytes);
                cliente.setFotoDorso(avatarBytes);
                cliente.setPais(paisDefault);
                
                cliente.setPaisCliente(paisDefault);
                cliente.setAdmitido("si");
                cliente.setVerificador(martinRevisor);
                
                cliente.setRematesAsistidos(0);
                cliente.setRematesGanados(0);
                cliente.setArticulosPublicados(0);
                cliente.setPujasRealizadas(0);

                Cliente clienteGuardado = clienteRepository.save(cliente);
                Integer userId = clienteGuardado.getIdentificador();

                // 3. Promover a Duenio insertando en tabla duenios
                int riesgo = random.nextInt(3) + 1;
                jdbcTemplate.update(
                    "INSERT INTO duenios (identificador, numeroPais, verificaciónFinanciera, verificaciónJudicial, calificacionRiesgo, verificador) VALUES (?, 54, 'si', 'si', ?, 1)",
                    userId, riesgo
                );

                // 4. Tarjeta de Crédito
                TarjetaCredito tc = new TarjetaCredito();
                tc.setTitularTarjeta(nombre + " " + apellido);
                if (i == 1) {
                    tc.setNumeroTarjeta("4532-1111-2222-3333");
                    tc.setFechaVencimiento("12/29");
                    tc.setCvv(123);
                } else if (i == 2) {
                    tc.setNumeroTarjeta("4532-1111-2222-4444");
                    tc.setFechaVencimiento("12/29");
                    tc.setCvv(456);
                } else {
                    tc.setNumeroTarjeta("4532-9999-8888-" + String.format("%04d", i));
                    tc.setFechaVencimiento("12/32");
                    tc.setCvv(100 + i);
                }
                tarjetaCreditoRepository.save(tc);

                // 5. Método de Pago
                MetodoPago mp = new MetodoPago();
                mp.setPersona(clienteGuardado);
                mp.setTarjetaCredito(tc);
                metodoPagoRepository.save(mp);
            }

            // Forzar limpieza de caché JPA para poder recuperar estas entidades como Duenio
            entityManager.clear();

            // 6. Crear 20 productos aceptados distribuidos uniformemente (2 productos por cada uno de los 10 usuarios)
            for (int i = 1; i <= 10; i++) {
                String email;
                if (i == 1) {
                    email = "comprador@bidowl.com";
                } else if (i == 2) {
                    email = "vendedor@bidowl.com";
                } else {
                    email = "usuario_seeder_" + i + "@bidowl.com";
                }
                Cliente clienteDuenio = clienteRepository.findByEmail(email).orElseThrow(() -> new IllegalStateException("Cliente no encontrado: " + email));
                Duenio duenio = duenioRepository.findById(clienteDuenio.getIdentificador()).orElseThrow(() -> new IllegalStateException("Dueño no encontrado para: " + email));
                
                for (int pIdx = 1; pIdx <= 2; pIdx++) {
                    int prodNum = ((i - 1) * 2) + pIdx;
                    String prodNombre = TITULOS_PRODUCTOS[prodNum - 1];
                    String prodDesc = DESCRIPCIONES_PRODUCTOS[prodNum - 1];

                    // Crear Producto
                    Producto prod = new Producto();
                    prod.setFecha(LocalDate.now());
                    prod.setDisponible("si"); // Ya aceptado y disponible para subasta
                    prod.setNombre(prodNombre);
                    prod.setDescripcion(prodDesc);
                    prod.setDescripcionCatalogo("Excelente estado de conservación. Verificado por el revisor " + martinRevisor.getNombre() + " " + martinRevisor.getApellido() + ".");
                    
                    String pdfUrl = "https://bidowl-inspecciones.s3.amazonaws.com/certificados/firmado_seeder_" + UUID.randomUUID().toString().substring(0, 8) + ".pdf";
                    prod.setDescripcionCompleta(pdfUrl);
                    
                    prod.setRevisor(martinRevisor);
                    prod.setDuenio(duenio);
                    
                    Producto prodGuardado = productoRepository.save(prod);

                    // Guardar Foto
                    if (avatarBytes != null) {
                        Foto foto = new Foto();
                        foto.setProducto(prodGuardado);
                        foto.setFoto(avatarBytes);
                        fotoRepository.save(foto);
                    }

                    // Crear Propuesta Comercial
                    BigDecimal valorBase = BigDecimal.valueOf(1000000L + prodNum * 500000L);
                    BigDecimal comisionVal = BigDecimal.valueOf(10.00); // 10% comision
                    
                    PropuestaComercial propuesta = new PropuestaComercial();
                    propuesta.setProducto(prodGuardado);
                    propuesta.setValorBase(valorBase);
                    propuesta.setComision(comisionVal);
                    propuesta.setUbicacionSubasta("Depósito Principal - BidOwl");
                    propuesta.setFechaEstimada(LocalDate.now().plusDays(15));
                    propuesta.setEstado("ACEPTADA");
                    propuestaComercialRepository.save(propuesta);

                    // Crear Seguro (póliza de cobertura del 110%)
                    BigDecimal importeSeguro = valorBase.multiply(BigDecimal.valueOf(1.10)).setScale(2, java.math.RoundingMode.HALF_UP);
                    String policyNumber = "POL-SEED-" + String.format("%06d", random.nextInt(1000000));
                    
                    Seguro seguro = new Seguro();
                    seguro.setNroPoliza(policyNumber);
                    seguro.setCompania("La Segunda Cooperativa de Seguros");
                    seguro.setPolizaCombinada("no");
                    seguro.setImporte(importeSeguro);
                    Seguro seguroGuardado = seguroRepository.save(seguro);

                    // Vincular Seguro al Producto
                    prodGuardado.setSeguro(seguroGuardado);
                    productoRepository.save(prodGuardado);

                    // Incrementar estadística de artículos publicados del dueño
                    Persona duenioPersona = duenio;
                    duenioPersona.setArticulosPublicados((duenioPersona.getArticulosPublicados() != null ? duenioPersona.getArticulosPublicados() : 0) + 1);
                    personaRepository.save(duenioPersona);

                    // Crear historial de Notificaciones (Simular el flujo manual completo de envío, tasación y aceptación)
                    // 1. Solicitud Recibida
                    Notificacion notif1 = new Notificacion();
                    notif1.setPersonaId(duenio.getIdentificador());
                    notif1.setTitulo("Solicitud de artículo recibida");
                    notif1.setCuerpo("Su solicitud del artículo '" + prodNombre + "' ha sido recibida correctamente y está en proceso de revisión inicial.");
                    notif1.setAccion("show_inspection_request:" + prodGuardado.getIdentificador());
                    notif1.setLeida(true); // Ya fue procesada
                    notif1.setFecha(java.time.LocalDateTime.now().minusHours(2));
                    notificacionRepository.save(notif1);

                    // 2. Propuesta Comercial Enviada/Revisada
                    Notificacion notif2 = new Notificacion();
                    notif2.setPersonaId(duenio.getIdentificador());
                    notif2.setTitulo("Su solicitud de artículo publicado fue revisada");
                    notif2.setCuerpo("Su solicitud del artículo '" + prodNombre + "' fue revisada por nuestro equipo y está lista para el siguiente paso de inspección física.");
                    notif2.setAccion("show_inspection_result:" + prodGuardado.getIdentificador());
                    notif2.setLeida(true); // Ya fue procesada
                    notif2.setFecha(java.time.LocalDateTime.now().minusHours(1));
                    notificacionRepository.save(notif2);

                    // 3. Artículo Aceptado
                    Notificacion notif3 = new Notificacion();
                    notif3.setPersonaId(duenio.getIdentificador());
                    notif3.setTitulo("Artículo aceptado");
                    notif3.setCuerpo("Su artículo '" + pdfUrl + "' ha pasado la inspección física.");
                    notif3.setAccion("show_inspection_result:" + prodGuardado.getIdentificador());
                    notif3.setLeida(false); // Esta queda sin leer
                    notif3.setFecha(java.time.LocalDateTime.now());
                    notificacionRepository.save(notif3);
                }
            }

            entityManager.clear();
        }
    }
}
