package com.bidowl.auctionplace.config;

import com.bidowl.auctionplace.entity.*;
import com.bidowl.auctionplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private PaisRepository paisRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

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

    @Override
    public void run(String... args) throws Exception {
        // 1. Inicializar Países
        if (paisRepository.count() == 0) {
            Pais argentina = new Pais(54, "Argentina", "ARG", "Buenos Aires", "Argentina", "Español");
            Pais uruguay = new Pais(598, "Uruguay", "URY", "Montevideo", "Uruguaya", "Español");
            Pais brasil = new Pais(55, "Brasil", "BRA", "Brasilia", "Brasileña", "Portugués");
            Pais chile = new Pais(56, "Chile", "CHL", "Santiago", "Chilena", "Español");
            paisRepository.saveAll(Arrays.asList(argentina, uruguay, brasil, chile));
        }

        Pais paisDefault = paisRepository.findById(54).orElse(null);

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
            empleado.setSector(1);
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

        // 4. Inicializar Subastador por Defecto
        if (subastadorRepository.count() == 0) {
            Subastador subastador = new Subastador();
            subastador.setNombre("Jorge");
            subastador.setApellido("Martillero");
            subastador.setDocumento("22111333");
            subastador.setEmail("jorge.subastas@bidowl.com");
            subastador.setContrasena("martillero123");
            subastador.setDireccion("Av. Cabildo 2200");
            subastador.setEstado("activo");
            subastador.setCategoria("platino");
            subastador.setPais(paisDefault);
            subastador.setMatricula("MAT-8947-C");
            subastador.setRegion("Buenos Aires");
            subastadorRepository.save(subastador);
        }

        Subastador subastadorDefault = subastadorRepository.findAll().get(0);

        // 5. Inicializar Subasta (en fecha > 10 días en el futuro por restricción SQL)
        if (subastaRepository.count() == 0) {
            Subasta subasta = new Subasta();
            subasta.setFecha(LocalDate.now().plusDays(15));
            subasta.setHora(LocalTime.of(18, 0));
            subasta.setEstado("abierta"); // abierta para que se puedan unir a pujar
            subasta.setSubastador(subastadorDefault);
            subasta.setUbicacion("Salón Gran Owl, Buenos Aires");
            subasta.setCapacidadAsistentes(150);
            subasta.setTieneDeposito("si");
            subasta.setSeguridadPropia("si");
            subasta.setCategoria("comun");
            subastaRepository.save(subasta);
        }

        Subasta subastaDefault = subastaRepository.findAll().get(0);

        // 6. Inicializar Catálogo de Subasta y Artículos
        if (catalogoRepository.count() == 0) {
            Catalogo catalogo = new Catalogo();
            catalogo.setDescripcion("Catálogo de Arte y Coleccionables Históricos");
            catalogo.setSubasta(subastaDefault);
            catalogo.setResponsable(empleadoDefault);
            catalogoRepository.save(catalogo);
        }

        Catalogo catalogoDefault = catalogoRepository.findAll().get(0);

        // 7. Inicializar Productos y asociarlos al Catálogo como Ítems
        if (productoRepository.count() == 0) {
            // Producto 1
            Producto p1 = new Producto();
            p1.setFecha(LocalDate.now());
            p1.setDisponible("si");
            p1.setDescripcionCatalogo("Juego de té inglés de porcelana, 18 piezas. Año 1910.");
            p1.setDescripcionCompleta("https://bidowl-media.s3.amazonaws.com/docs/juego-te-porcelana.pdf");
            p1.setRevisor(empleadoDefault);
            p1.setDuenio(duenioDefault);
            productoRepository.save(p1);

            // Producto 2
            Producto p2 = new Producto();
            p2.setFecha(LocalDate.now());
            p2.setDisponible("si");
            p2.setDescripcionCatalogo("Pintura al óleo sobre lienzo 'El Atardecer de BidOwl', artista local.");
            p2.setDescripcionCompleta("https://bidowl-media.s3.amazonaws.com/docs/atardecer-bidowl.pdf");
            p2.setRevisor(empleadoDefault);
            p2.setDuenio(duenioDefault);
            productoRepository.save(p2);

            // Ítem Catálogo 1
            ItemCatalogo item1 = new ItemCatalogo();
            item1.setCatalogo(catalogoDefault);
            item1.setProducto(p1);
            item1.setPrecioBase(BigDecimal.valueOf(10000)); // Precio base de la demo (10,000)
            item1.setComision(BigDecimal.valueOf(1000));
            item1.setSubastado("no");
            itemCatalogoRepository.save(item1);

            // Ítem Catálogo 2
            ItemCatalogo item2 = new ItemCatalogo();
            item2.setCatalogo(catalogoDefault);
            item2.setProducto(p2);
            item2.setPrecioBase(BigDecimal.valueOf(15000));
            item2.setComision(BigDecimal.valueOf(1500));
            item2.setSubastado("no");
            itemCatalogoRepository.save(item2);
        }
    }
}
