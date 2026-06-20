package com.bidowl.auctionplace.config;

import com.bidowl.auctionplace.entity.*;
import com.bidowl.auctionplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private PaisRepository paisRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private SectorRepository sectorRepository;

    @Autowired
    private DuenioRepository duenioRepository;

    @Autowired
    private SubastadorRepository subastadorRepository;

    @Autowired
    private SubastaRepository subastaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CatalogoRepository catalogoRepository;

    @Autowired
    private ItemCatalogoRepository itemCatalogoRepository;

    @Autowired
    private FotoRepository fotoRepository;

    @Override
    public void run(String... args) throws Exception {
        // Cargar recursos de imágenes locales
        byte[] rollingStoneBytes = null;
        byte[] avatarBytes = null;
        try {
            var resourceStream1 = getClass().getResourceAsStream("/rolling_stone_auction.png");
            if (resourceStream1 != null) {
                rollingStoneBytes = resourceStream1.readAllBytes();
            }
            var resourceStream2 = getClass().getResourceAsStream("/auctioneer_avatar.png");
            if (resourceStream2 != null) {
                avatarBytes = resourceStream2.readAllBytes();
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
            Empleado empleado = new Empleado();
            empleado.setNombre("Martín");
            empleado.setApellido("Palermo");
            empleado.setDocumento("30123456");
            empleado.setEmail("martin.verificador@bidowl.com");
            empleado.setContrasena("palermo123");
            empleado.setDireccion("Av. Figueroa Alcorta 1234");
            empleado.setEstado("activo");
            empleado.setCategoria("especial");
            empleado.setPais(paisDefault);
            empleado.setCargo("Revisor Senior de Coleccionables");
            empleado.setSector(sectorInspeccion != null ? sectorInspeccion.getIdentificador() : 1);
            empleadoRepository.save(empleado);
        }

        Empleado empleadoDefault = empleadoRepository.findAll().get(0);

        // 3. Inicializar Dueño de Productos por Defecto
        if (duenioRepository.count() == 0) {
            Duenio duenio = new Duenio();
            duenio.setNombre("Juan");
            duenio.setApellido("Pérez");
            duenio.setDocumento("25987654");
            duenio.setEmail("juan.perez@test.com");
            duenio.setContrasena("juanperez123");
            duenio.setDireccion("Calle Florida 550");
            duenio.setEstado("activo");
            duenio.setCategoria("comun");
            duenio.setPais(paisDefault);
            duenio.setPaisDuenio(paisDefault);
            duenio.setVerificacionFinanciera("si");
            duenio.setVerificacionJudicial("si");
            duenio.setCalificacionRiesgo(1);
            duenio.setVerificador(empleadoDefault);
            duenioRepository.save(duenio);
        }

        Duenio duenioDefault = duenioRepository.findAll().get(0);

        // 4. Inicializar Subastador por Defecto (Agustin Blanco Vocos)
        if (subastadorRepository.count() == 0) {
            Subastador subastador = new Subastador();
            subastador.setNombre("Agustin");
            subastador.setApellido("Blanco Vocos");
            subastador.setDocumento("22111333");
            subastador.setEmail("jorge.subastas@bidowl.com");
            subastador.setContrasena("martillero123");
            subastador.setDireccion("Av. Cabildo 2200");
            subastador.setEstado("activo");
            subastador.setCategoria("platino");
            subastador.setPais(paisDefault);
            subastador.setMatricula("MAT-8947-C");
            subastador.setRegion("Buenos Aires");
            subastador.setFoto(avatarBytes);
            subastadorRepository.save(subastador);
        }

        Subastador subastadorDefault = subastadorRepository.findAll().get(0);

        // 5. Inicializar Subastas (una activa y otra a punto de iniciar)
        if (subastaRepository.count() == 0) {
            LocalDateTime now = LocalDateTime.now();

            // Subasta 1: Activa (inició hace 2 horas)
            LocalDateTime subasta1Start = now.minusHours(2);
            Subasta subasta1 = new Subasta();
            subasta1.setFecha(subasta1Start.toLocalDate());
            subasta1.setHora(subasta1Start.toLocalTime().withNano(0));
            subasta1.setEstado("abierta");
            subasta1.setSubastador(subastadorDefault);
            subasta1.setUbicacion("Pilar, Buenos Aires");
            subasta1.setCapacidadAsistentes(150);
            subasta1.setTieneDeposito("si");
            subasta1.setSeguridadPropia("si");
            subasta1.setCategoria("comun");
            subasta1.setTitulo("Subasta de Colección Original \"Rolling Stone\"");
            subasta1.setDescripcion("Presentamos una oportunidad excepcional para acceder a una cuidada selección de ejemplares originales de una de las revistas más influyentes en la historia de la música, el entretenimiento y la cultura contemporánea. Esta colección reúne ediciones emblemáticas que capturan momentos únicos de la historia del rock.");
            subasta1.setFoto(rollingStoneBytes);
            subasta1.setDireccionDetallada("Ubicado en Manuel Belgrano 501, Villa Morra.");
            subastaRepository.save(subasta1);

            // Subasta 2: Próxima a iniciar (inicia en 10 minutos)
            LocalDateTime subasta2Start = now.plusMinutes(10);
            Subasta subasta2 = new Subasta();
            subasta2.setFecha(subasta2Start.toLocalDate());
            subasta2.setHora(subasta2Start.toLocalTime().withNano(0));
            subasta2.setEstado("abierta");
            subasta2.setSubastador(subastadorDefault);
            subasta2.setUbicacion("Tigre, Buenos Aires");
            subasta2.setCapacidadAsistentes(150);
            subasta2.setTieneDeposito("si");
            subasta2.setSeguridadPropia("si");
            subasta2.setCategoria("comun");
            subasta2.setTitulo("Colección Vintage Guitarras Gibson & Fender");
            subasta2.setDescripcion("Una venta exclusiva de instrumentos vintage cuidadosamente seleccionados por luthiers profesionales. Esta colección cuenta con piezas históricas de las dos marcas más icónicas en el mundo de las guitarras eléctricas, Gibson y Fender, que definieron el sonido de generaciones.");
            subasta2.setFoto(rollingStoneBytes);
            subasta2.setDireccionDetallada("Ubicado en Av. de las Naciones 123, Tigre.");
            subastaRepository.save(subasta2);
        }

        List<Subasta> subastas = subastaRepository.findAll();
        Subasta subasta1 = subastas.get(0);
        Subasta subasta2 = subastas.size() > 1 ? subastas.get(1) : subasta1;

        // 6. Inicializar Catálogos de Subasta
        if (catalogoRepository.count() == 0) {
            Catalogo catalogo1 = new Catalogo();
            catalogo1.setDescripcion("Catálogo de Arte y Coleccionables Históricos");
            catalogo1.setSubasta(subasta1);
            catalogo1.setResponsable(empleadoDefault);
            catalogoRepository.save(catalogo1);

            if (subastas.size() > 1) {
                Catalogo catalogo2 = new Catalogo();
                catalogo2.setDescripcion("Catálogo de Guitarras Legendarias");
                catalogo2.setSubasta(subasta2);
                catalogo2.setResponsable(empleadoDefault);
                catalogoRepository.save(catalogo2);
            }
        }

        List<Catalogo> catalogos = catalogoRepository.findAll();
        Catalogo catalogo1 = catalogos.get(0);
        Catalogo catalogo2 = catalogos.size() > 1 ? catalogos.get(1) : catalogo1;

        // 7. Inicializar Productos y asociarlos al Catálogo como Ítems
        if (productoRepository.count() == 0) {
            // --- PRODUCTOS SUBASTA 1 ---
            // Producto 1.1
            Producto p1_1 = new Producto();
            p1_1.setFecha(LocalDate.now());
            p1_1.setDisponible("si");
            p1_1.setDescripcionCatalogo("Juego de té inglés de porcelana, 18 piezas. Año 1910.");
            p1_1.setDescripcionCompleta("https://bidowl-media.s3.amazonaws.com/docs/juego-te-porcelana.pdf");
            p1_1.setRevisor(empleadoDefault);
            p1_1.setDuenio(duenioDefault);
            p1_1.setNombre("Juego de Té Inglés Antiguo");
            p1_1.setDescripcion("Hermoso juego de té de porcelana inglesa del año 1910 con finos detalles de oro pintados a mano. Consta de 18 piezas.");
            productoRepository.save(p1_1);
            saveProductPhoto(p1_1, rollingStoneBytes);

            // Producto 1.2
            Producto p1_2 = new Producto();
            p1_2.setFecha(LocalDate.now());
            p1_2.setDisponible("si");
            p1_2.setDescripcionCatalogo("Pintura al óleo sobre lienzo 'El Atardecer de BidOwl', artista local.");
            p1_2.setDescripcionCompleta("https://bidowl-media.s3.amazonaws.com/docs/atardecer-bidowl.pdf");
            p1_2.setRevisor(empleadoDefault);
            p1_2.setDuenio(duenioDefault);
            p1_2.setNombre("Óleo 'El Atardecer de BidOwl'");
            p1_2.setDescripcion("Obra original pintada al óleo sobre lienzo de lino por el artista local. Captura la serenidad de una tarde otoñal.");
            productoRepository.save(p1_2);
            saveProductPhoto(p1_2, rollingStoneBytes);

            // Producto 1.3
            Producto p1_3 = new Producto();
            p1_3.setFecha(LocalDate.now());
            p1_3.setDisponible("si");
            p1_3.setDescripcionCatalogo("Disco de Platino firmado por Mick Jagger y Keith Richards en 1978.");
            p1_3.setDescripcionCompleta("https://bidowl-media.s3.amazonaws.com/docs/disco-platino-1978.pdf");
            p1_3.setRevisor(empleadoDefault);
            p1_3.setDuenio(duenioDefault);
            p1_3.setNombre("Disco de Platino Firmado 1978");
            p1_3.setDescripcion("Premio oficial de disco de platino otorgado por ventas récord en 1978. Autografiado individualmente por Mick Jagger, Keith Richards, y Ron Wood.");
            productoRepository.save(p1_3);
            saveProductPhoto(p1_3, rollingStoneBytes);

            // Producto 1.4
            Producto p1_4 = new Producto();
            p1_4.setFecha(LocalDate.now());
            p1_4.setDisponible("si");
            p1_4.setDescripcionCatalogo("Baquetas originales de madera usadas en concierto por Charlie Watts.");
            p1_4.setDescripcionCompleta("https://bidowl-media.s3.amazonaws.com/docs/baquetas-watts.pdf");
            p1_4.setRevisor(empleadoDefault);
            p1_4.setDuenio(duenioDefault);
            p1_4.setNombre("Baquetas Usadas de Charlie Watts");
            p1_4.setDescripcion("Un par de baquetas originales de madera usadas en concierto por Charlie Watts durante los años 80, firmadas por el legendario baterista.");
            productoRepository.save(p1_4);
            saveProductPhoto(p1_4, rollingStoneBytes);

            // Producto 1.5
            Producto p1_5 = new Producto();
            p1_5.setFecha(LocalDate.now());
            p1_5.setDisponible("si");
            p1_5.setDescripcionCatalogo("Póster promocional original de la gira norteamericana de la banda en 1975.");
            p1_5.setDescripcionCompleta("https://bidowl-media.s3.amazonaws.com/docs/poster-1975.pdf");
            p1_5.setRevisor(empleadoDefault);
            p1_5.setDuenio(duenioDefault);
            p1_5.setNombre("Póster de Gira de 1975 Enmarcado");
            p1_5.setDescripcion("Póster promocional original de la gira norteamericana de la banda en 1975, enmarcado con cristal protector UV.");
            productoRepository.save(p1_5);
            saveProductPhoto(p1_5, rollingStoneBytes);

            // --- PRODUCTOS SUBASTA 2 ---
            // Producto 2.1
            Producto p2_1 = new Producto();
            p2_1.setFecha(LocalDate.now());
            p2_1.setDisponible("si");
            p2_1.setDescripcionCatalogo("Gibson Les Paul Custom 1968 Ebony.");
            p2_1.setDescripcionCompleta("https://bidowl-media.s3.amazonaws.com/docs/gibson-1968.pdf");
            p2_1.setRevisor(empleadoDefault);
            p2_1.setDuenio(duenioDefault);
            p2_1.setNombre("Gibson Les Paul Custom 1968");
            p2_1.setDescripcion("Modelo histórico reedición 1968 con pastillas humbucker originales. Acabado Ebony de alto brillo en impecable estado de conservación.");
            productoRepository.save(p2_1);
            saveProductPhoto(p2_1, rollingStoneBytes);

            // Producto 2.2
            Producto p2_2 = new Producto();
            p2_2.setFecha(LocalDate.now());
            p2_2.setDisponible("si");
            p2_2.setDescripcionCatalogo("Fender Stratocaster Sunburst 1962.");
            p2_2.setDescripcionCompleta("https://bidowl-media.s3.amazonaws.com/docs/fender-1962.pdf");
            p2_2.setRevisor(empleadoDefault);
            p2_2.setDuenio(duenioDefault);
            p2_2.setNombre("Fender Stratocaster Sunburst 1962");
            p2_2.setDescripcion("Cuerpo de aliso original con mástil de arce y diapasón de palisandro. Todo el cableado y micrófonos son de época.");
            productoRepository.save(p2_2);
            saveProductPhoto(p2_2, rollingStoneBytes);

            // Producto 2.3
            Producto p2_3 = new Producto();
            p2_3.setFecha(LocalDate.now());
            p2_3.setDisponible("si");
            p2_3.setDescripcionCatalogo("Gibson SG Standard Cherry 1971.");
            p2_3.setDescripcionCompleta("https://bidowl-media.s3.amazonaws.com/docs/gibson-sg-1971.pdf");
            p2_3.setRevisor(empleadoDefault);
            p2_3.setDuenio(duenioDefault);
            p2_3.setNombre("Gibson SG Standard Cherry 1971");
            p2_3.setDescripcion("Modelo clásico Cherry Red con trémolo Bigsby original. Una guitarra muy resonante con trastes originales en excelente estado.");
            productoRepository.save(p2_3);
            saveProductPhoto(p2_3, rollingStoneBytes);

            // Producto 2.4
            Producto p2_4 = new Producto();
            p2_4.setFecha(LocalDate.now());
            p2_4.setDisponible("si");
            p2_4.setDescripcionCatalogo("Fender Telecaster Butterscotch 1952.");
            p2_4.setDescripcionCompleta("https://bidowl-media.s3.amazonaws.com/docs/fender-tele-1952.pdf");
            p2_4.setRevisor(empleadoDefault);
            p2_4.setDuenio(duenioDefault);
            p2_4.setNombre("Fender Telecaster Butterscotch 1952");
            p2_4.setDescripcion("La legendaria \"Blackguard\" Telecaster en acabado Butterscotch Blonde. Todo un ícono del rock y el country vintage.");
            productoRepository.save(p2_4);
            saveProductPhoto(p2_4, rollingStoneBytes);

            // --- ITEMS DE CATÁLOGO SUBASTA 1 ---
            saveItemCatalogo(catalogo1, p1_1, 1000000);
            saveItemCatalogo(catalogo1, p1_2, 850000);
            saveItemCatalogo(catalogo1, p1_3, 500000);
            saveItemCatalogo(catalogo1, p1_4, 300000);
            saveItemCatalogo(catalogo1, p1_5, 150000);

            // --- ITEMS DE CATÁLOGO SUBASTA 2 ---
            saveItemCatalogo(catalogo2, p2_1, 2500000);
            saveItemCatalogo(catalogo2, p2_2, 3000000);
            saveItemCatalogo(catalogo2, p2_3, 1800000);
            saveItemCatalogo(catalogo2, p2_4, 4000000);
        }
    }

    private void saveProductPhoto(Producto producto, byte[] photoBytes) {
        if (photoBytes != null) {
            Foto foto = new Foto();
            foto.setProducto(producto);
            foto.setFoto(photoBytes);
            fotoRepository.save(foto);
        }
    }

    private void saveItemCatalogo(Catalogo catalogo, Producto producto, long precioBaseValue) {
        ItemCatalogo item = new ItemCatalogo();
        item.setCatalogo(catalogo);
        item.setProducto(producto);
        item.setPrecioBase(BigDecimal.valueOf(precioBaseValue));
        item.setComision(BigDecimal.valueOf(precioBaseValue * 0.1));
        item.setSubastado("no");
        itemCatalogoRepository.save(item);
    }
}
