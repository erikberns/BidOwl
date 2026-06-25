package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.entity.*;
import com.bidowl.auctionplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
/**
 * Servicio encargado de gestionar los artículos individuales que pertenecen a un catálogo.
 * Controla el proceso de finalización de subastas por ítem, determina ganadores basándose en ofertas máximas,
 * transfiere propiedad a compradores y ejecuta la auto-compra por parte de la empresa si no hay pujas.
 */
@Service
public class ItemCatalogoService {

    private static final ZoneId ARGENTINA_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");

    @Autowired
    private ItemCatalogoRepository itemCatalogoRepository;

    @Autowired
    private PujoRepository pujoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private RegistroDeSubastaRepository registroDeSubastaRepository;

    @Autowired
    private MetodoPagoRepository metodoPagoRepository;

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private SubastaRepository subastaRepository;

    @Autowired
    private DuenioRepository duenioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private MonedaService monedaService;

    @Autowired
    private ChequeCompromisoService chequeCompromisoService;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    public List<ItemCatalogo> obtenerItemsPorCatalogo(Integer catalogoId) {
        return itemCatalogoRepository.findByCatalogoIdentificador(catalogoId);
    }

    public ItemCatalogo obtenerPorId(Integer id) throws Exception {
        return itemCatalogoRepository.findById(id)
                .orElseThrow(() -> new Exception("Item de catálogo no encontrado."));
    }

    public ItemCatalogo finalizarSubastaDeItem(Integer itemId) throws Exception {
        ItemCatalogo item = obtenerPorId(itemId);
        if ("si".equalsIgnoreCase(item.getSubastado())) {
            throw new Exception("Este ítem ya fue subastado y finalizado.");
        }

        Optional<Pujo> pujaGanadoraOpt = pujoRepository.findFirstByItemIdentificadorOrderByImporteDesc(itemId);
        ItemCatalogo guardado;

        if (pujaGanadoraOpt.isPresent()) {
            Pujo pujaGanadora = pujaGanadoraOpt.get();
            pujaGanadora.setGanador("si");
            pujoRepository.save(pujaGanadora);
            chequeCompromisoService.ejecutarCompromisoGanador(pujaGanadora);

            item.setSubastado("si");
            guardado = itemCatalogoRepository.save(item);

            Asistente asistenteGanador = pujaGanadora.getAsistente();
            Cliente clienteGanador = asistenteGanador.getCliente();

            clienteGanador.setRematesGanados(clienteGanador.getRematesGanados() + 1);
            clienteRepository.save(clienteGanador);

            // Transferir propiedad al usuario ganador y poner disponible = "no"
            Duenio duenioGanador = duenioRepository.findById(clienteGanador.getIdentificador()).orElse(null);
            if (duenioGanador == null) {
                Integer numeroPais = (clienteGanador.getPaisCliente() != null) ? clienteGanador.getPaisCliente().getNumero() : null;
                int riesgo = new java.util.Random().nextInt(3) + 1;
                jdbcTemplate.update(
                    "INSERT INTO duenios (identificador, numeroPais, verificaciónFinanciera, verificaciónJudicial, calificacionRiesgo, verificador) VALUES (?, ?, 'si', 'si', ?, 1)",
                    clienteGanador.getIdentificador(), numeroPais, riesgo
                );
                
                entityManager.clear();
                duenioGanador = duenioRepository.findById(clienteGanador.getIdentificador()).orElse(null);
            }
            Producto producto = item.getProducto();
            Duenio duenioVendedor = null;
            if (producto != null) {
                duenioVendedor = producto.getDuenio();
                producto.setDuenio(duenioGanador);
                producto.setDisponible("no");
                productoRepository.save(producto);
            }

            RegistroDeSubasta registro = new RegistroDeSubasta();
            registro.setSubasta(item.getCatalogo().getSubasta());
            registro.setDuenio(duenioVendedor != null ? duenioVendedor : (producto != null ? producto.getDuenio() : null));
            registro.setProducto(producto);
            registro.setCliente(clienteGanador);
            
            MetodoPago metodoGanador = pujaGanadora.getMetodoPago();
            if (metodoGanador != null) {
                registro.setMetodoPago(metodoGanador);
            } else {
                List<MetodoPago> pagos = metodoPagoRepository.findByPersonaIdentificador(clienteGanador.getIdentificador());
                if (!pagos.isEmpty()) {
                    String monedaSubasta = monedaService.monedaSubasta(item.getCatalogo() != null ? item.getCatalogo().getSubasta() : null);
                    MetodoPago pagoCompatible = pagos.stream()
                            .filter(pago -> monedaSubasta.equals(monedaService.monedaMetodoPago(pago)))
                            .findFirst()
                            .orElse(pagos.get(0));
                    registro.setMetodoPago(pagoCompatible);
                } else {
                // Crear un método de pago ficticio para evitar fallar la finalización si el ganador no tiene métodos registrados
                    MetodoPago metodoFicticio = new MetodoPago();
                    metodoFicticio.setPersona(clienteGanador);
                    metodoPagoRepository.save(metodoFicticio);
                    registro.setMetodoPago(metodoFicticio);
                }
            }

            registro.setImporte(pujaGanadora.getImporte());
            BigDecimal comisionPorcentaje = item.getComision() != null ? item.getComision() : BigDecimal.ZERO;
            BigDecimal comisionCalculada = pujaGanadora.getImporte()
                    .multiply(comisionPorcentaje)
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            registro.setComision(comisionCalculada);

            registroDeSubastaRepository.save(registro);

            // Generar notificación para el usuario ganador
            Notificacion notificacion = new Notificacion();
            notificacion.setPersonaId(clienteGanador.getIdentificador());
            notificacion.setTitulo("¡Ha obtenido un nuevo objeto!");
            notificacion.setCuerpo("Has ganado la subasta para '" + item.getProducto().getNombre() + "'. Te entregaremos la factura correspondiente para formalizar la operación. A continuación, podrás confirmar la modalidad de entrega.");
            notificacion.setAccion("show_bid_won:" + item.getIdentificador());
            notificacion.setLeida(false);
            notificacion.setFecha(fechaHoraArgentina());
            notificacionService.guardarSiNoExiste(notificacion);
        } else {
            // Regla TPO: Si nadie puja por un artículo, la empresa compra el mismo por el valor base al finalizar
            Duenio companyDuenio = duenioRepository.findAll().stream()
                    .filter(d -> "empresa@bidowl.com".equalsIgnoreCase(d.getEmail()))
                    .findFirst()
                    .orElse(null);
            if (companyDuenio == null) {
                companyDuenio = new Duenio();
                companyDuenio.setDocumento("99999999");
                companyDuenio.setNombre("BidOwl");
                companyDuenio.setApellido("S.A.");
                companyDuenio.setEmail("empresa@bidowl.com");
                companyDuenio.setContrasena("bidowl123");
                companyDuenio.setDireccion("Av. Siempreviva 742");
                companyDuenio.setEstado("activo");
                companyDuenio.setCategoria("platino");
                companyDuenio.setAdmitido("si");
                companyDuenio.setCategoriaCliente("platino");
                companyDuenio.setVerificacionFinanciera("si");
                companyDuenio.setVerificacionJudicial("si");
                companyDuenio.setCalificacionRiesgo(1);
                
                Empleado verificador = empleadoRepository.findAll().stream().findFirst().orElse(null);
                companyDuenio.setVerificador(verificador);
                companyDuenio.setVerificadorDuenio(verificador);
                
                companyDuenio = duenioRepository.save(companyDuenio);
            }
            
            Producto producto = item.getProducto();
            if (producto != null) {
                producto.setDuenio(companyDuenio);
                producto.setDisponible("no");
                productoRepository.save(producto);
            }
            
            item.setSubastado("si");
            guardado = itemCatalogoRepository.save(item);
        }

        // Regla: La subasta al no tener mas objetos no subastados, debera terminar sin importar cuanto tiempo restante quede.
        Subasta subasta = guardado.getCatalogo().getSubasta();
        if (subasta != null) {
            List<ItemCatalogo> itemsEnCatalogo = itemCatalogoRepository.findByCatalogoSubastaIdentificador(subasta.getIdentificador());
            itemsEnCatalogo.sort(java.util.Comparator.comparing(ItemCatalogo::getIdentificador));
            boolean todosSubastados = itemsEnCatalogo.stream()
                    .allMatch(it -> "si".equalsIgnoreCase(it.getSubastado()));
            if (todosSubastados) {
                subasta.setEstado("carrada");
                subastaRepository.save(subasta);
            } else {
                // Set next item's timer to 10 minutes from now
                Optional<ItemCatalogo> siguienteItemOpt = itemsEnCatalogo.stream()
                        .filter(it -> !"si".equalsIgnoreCase(it.getSubastado()))
                        .findFirst();
                if (siguienteItemOpt.isPresent()) {
                    ItemCatalogo siguienteItem = siguienteItemOpt.get();
                    siguienteItem.setFechaFinPuja(fechaHoraArgentina().plusMinutes(10));
                    itemCatalogoRepository.save(siguienteItem);
                }
            }
        }

        return guardado;
    }

    private LocalDateTime fechaHoraArgentina() {
        return LocalDateTime.now(ARGENTINA_ZONE);
    }

}
