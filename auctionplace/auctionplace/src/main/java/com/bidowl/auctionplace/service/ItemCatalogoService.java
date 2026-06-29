// Finaliza lotes, adjudica productos y transfiere su propiedad al ganador o a BidOwl.
package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.entity.*;
import com.bidowl.auctionplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
/**
 * Servicio encargado de gestionar los artículos individuales que pertenecen a un catálogo.
 * Controla el proceso de finalización de subastas por ítem, determina ganadores basándose en ofertas máximas,
 * transfiere propiedad a compradores y ejecuta la auto-compra por parte de la empresa si no hay pujas.
 */
@Service
public class ItemCatalogoService {

    private static final ZoneId ARGENTINA_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");
    private static final String BIDOWL_EMAIL = "empresa@bidowl.com";

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
    private PaisRepository paisRepository;

    @Autowired
    private MonedaService monedaService;

    @Autowired
    private ChequeCompromisoService chequeCompromisoService;

    @Autowired
    private PagoAutomaticoService pagoAutomaticoService;

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

    @Transactional(rollbackFor = Exception.class)
    public ItemCatalogo finalizarSubastaDeItem(Integer itemId) throws Exception {
        ItemCatalogo item = itemCatalogoRepository.findByIdentificadorForUpdate(itemId)
                .orElseThrow(() -> new Exception("Item de catálogo no encontrado."));
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

            registro = registroDeSubastaRepository.save(registro);
            boolean pagoCompleto = pagoAutomaticoService.procesar(registro);

            // Informar el resultado del cobro automatico junto con la adjudicacion.
            Notificacion notificacion = new Notificacion();
            notificacion.setPersonaId(clienteGanador.getIdentificador());
            notificacion.setTitulo(pagoCompleto ? "Pago realizado" : "Pago incompleto y multa aplicada");
            notificacion.setCuerpo(pagoCompleto
                    ? "Ganaste '" + item.getProducto().getNombre() + "' y el pago de "
                            + registro.getMontoPagado().toPlainString() + " se realizo correctamente."
                    : "Ganaste '" + item.getProducto().getNombre()
                            + "', pero el importe supero el limite del medio de pago. Se genero la multa correspondiente y tu participacion quedo suspendida hasta regularizar la deuda.");
            notificacion.setAccion("show_bid_won:" + item.getIdentificador());
            notificacion.setLeida(false);
            notificacion.setFecha(LocalDateTime.now());
            notificacionService.guardarSiNoExiste(notificacion);
        } else {
            // Regla TPO: Si nadie puja por un artículo, la empresa compra el mismo por el valor base al finalizar
            Duenio companyDuenio = obtenerOCrearDuenioBidOwl();
            
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

    private Duenio obtenerOCrearDuenioBidOwl() {
        return duenioRepository.findByEmailIgnoreCase(BIDOWL_EMAIL)
                .orElseGet(() -> {
                    Empleado verificador = empleadoRepository.findAll().stream().findFirst().orElse(null);
                    Pais pais = paisRepository.findById(54).orElse(null);
                    Duenio bidOwl = new Duenio();
                    bidOwl.setDocumento("99999999");
                    bidOwl.setNombre("BidOwl");
                    bidOwl.setApellido("S.A.");
                    bidOwl.setEmail(BIDOWL_EMAIL);
                    bidOwl.setContrasena(UUID.randomUUID().toString());
                    bidOwl.setContrasenaCambiada(true);
                    bidOwl.setDireccion("Deposito Central BidOwl Pilar");
                    bidOwl.setEstado("activo");
                    bidOwl.setCategoria("platino");
                    bidOwl.setPais(pais);
                    bidOwl.setPaisCliente(pais);
                    bidOwl.setPaisDuenio(pais);
                    bidOwl.setAdmitido("si");
                    bidOwl.setCategoriaCliente("platino");
                    bidOwl.setVerificacionFinanciera("si");
                    bidOwl.setVerificacionJudicial("si");
                    bidOwl.setCalificacionRiesgo(1);
                    bidOwl.setVerificador(verificador);
                    bidOwl.setVerificadorDuenio(verificador);
                    bidOwl.setRematesAsistidos(0);
                    bidOwl.setRematesGanados(0);
                    bidOwl.setArticulosPublicados(0);
                    bidOwl.setPujasRealizadas(0);
                    return duenioRepository.save(bidOwl);
                });
    }

}
