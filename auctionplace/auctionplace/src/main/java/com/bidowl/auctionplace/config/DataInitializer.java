package com.bidowl.auctionplace.config;

import com.bidowl.auctionplace.entity.*;
import com.bidowl.auctionplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

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

    @Override
    public void run(String... args) throws Exception {
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

        // 5. Inicializar Clientes de Prueba (Comprador y Vendedor)
        Empleado martin = empleadoRepository.findAll().stream().findFirst().orElse(null);

        if (clienteRepository.findByEmail("comprador@bidowl.com").isEmpty()) {
            // Registro Pendiente
            RegistroPendiente rp = new RegistroPendiente();
            rp.setDocumento("22222222");
            rp.setNombre("Comprador");
            rp.setApellido("De Arte");
            rp.setEmail("comprador@bidowl.com");
            rp.setDireccion("Palermo 456");
            rp.setPais(paisDefault != null ? paisDefault.getNombre() : "Argentina");
            rp.setFotoFrente(avatarBytes);
            rp.setFotoDorso(avatarBytes);
            rp.setEstado("APROBADO");
            registroPendienteRepository.save(rp);

            // Cliente
            Cliente cliente = new Cliente();
            cliente.setNombre("Comprador");
            cliente.setApellido("De Arte");
            cliente.setDocumento("22222222");
            cliente.setEmail("comprador@bidowl.com");
            cliente.setContrasena("comprador123");
            cliente.setContrasenaCambiada(true);
            cliente.setDireccion("Palermo 456");
            cliente.setEstado("activo");
            cliente.setCategoria("oro");
            cliente.setFoto(avatarBytes);
            cliente.setFotoFrente(avatarBytes);
            cliente.setFotoDorso(avatarBytes);
            cliente.setPais(paisDefault);
            
            cliente.setPaisCliente(paisDefault);
            cliente.setAdmitido("si");
            cliente.setCategoriaCliente("oro");
            cliente.setVerificador(martin);
            
            cliente.setRematesAsistidos(0);
            cliente.setRematesGanados(0);
            cliente.setArticulosPublicados(0);
            cliente.setPujasRealizadas(0);

            Cliente compradorGuardado = clienteRepository.save(cliente);

            // Tarjeta de Crédito
            TarjetaCredito tc = new TarjetaCredito();
            tc.setNumeroTarjeta("4532-1111-2222-3333");
            tc.setTitularTarjeta("Comprador De Arte");
            tc.setFechaVencimiento("12/29");
            tc.setCvv(123);
            tarjetaCreditoRepository.save(tc);

            // Método de Pago
            MetodoPago mp = new MetodoPago();
            mp.setPersona(compradorGuardado);
            mp.setTarjetaCredito(tc);
            metodoPagoRepository.save(mp);
        }

        if (clienteRepository.findByEmail("vendedor@bidowl.com").isEmpty()) {
            // Registro Pendiente
            RegistroPendiente rp = new RegistroPendiente();
            rp.setDocumento("11111111");
            rp.setNombre("Vendedor");
            rp.setApellido("De Arte");
            rp.setEmail("vendedor@bidowl.com");
            rp.setDireccion("San Telmo 123");
            rp.setPais(paisDefault != null ? paisDefault.getNombre() : "Argentina");
            rp.setFotoFrente(avatarBytes);
            rp.setFotoDorso(avatarBytes);
            rp.setEstado("APROBADO");
            registroPendienteRepository.save(rp);

            // Cliente
            Cliente cliente = new Cliente();
            cliente.setNombre("Vendedor");
            cliente.setApellido("De Arte");
            cliente.setDocumento("11111111");
            cliente.setEmail("vendedor@bidowl.com");
            cliente.setContrasena("vendedor123");
            cliente.setContrasenaCambiada(true);
            cliente.setDireccion("San Telmo 123");
            cliente.setEstado("activo");
            cliente.setCategoria("especial");
            cliente.setFoto(avatarBytes);
            cliente.setFotoFrente(avatarBytes);
            cliente.setFotoDorso(avatarBytes);
            cliente.setPais(paisDefault);
            
            cliente.setPaisCliente(paisDefault);
            cliente.setAdmitido("si");
            cliente.setCategoriaCliente("especial");
            cliente.setVerificador(martin);
            
            cliente.setRematesAsistidos(0);
            cliente.setRematesGanados(0);
            cliente.setArticulosPublicados(0);
            cliente.setPujasRealizadas(0);

            Cliente vendedorGuardado = clienteRepository.save(cliente);

            // Cuenta Bancaria
            CuentaBancaria cb = new CuentaBancaria();
            cb.setTitularCuenta("Vendedor De Arte");
            cb.setNombreBanco("Banco de la Nación");
            cb.setPais(paisDefault);
            cb.setCbuIban("0110222-333333333333333");
            cb.setMoneda("pesos");
            cb.setComprobante(avatarBytes);
            cuentaBancariaRepository.save(cb);

            // Método de Pago
            MetodoPago mp = new MetodoPago();
            mp.setPersona(vendedorGuardado);
            mp.setCuentaBancaria(cb);
            metodoPagoRepository.save(mp);
        }
    }
}
