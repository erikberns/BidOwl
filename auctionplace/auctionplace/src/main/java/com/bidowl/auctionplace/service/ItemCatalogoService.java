package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.entity.*;
import com.bidowl.auctionplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ItemCatalogoService {

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
    private NotificacionRepository notificacionRepository;

    @Autowired
    private SubastaRepository subastaRepository;

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

            item.setSubastado("si");
            guardado = itemCatalogoRepository.save(item);

            Asistente asistenteGanador = pujaGanadora.getAsistente();
            Cliente clienteGanador = asistenteGanador.getCliente();

            clienteGanador.setRematesGanados(clienteGanador.getRematesGanados() + 1);
            clienteRepository.save(clienteGanador);

            RegistroDeSubasta registro = new RegistroDeSubasta();
            registro.setSubasta(item.getCatalogo().getSubasta());
            registro.setDuenio(item.getProducto().getDuenio());
            registro.setProducto(item.getProducto());
            registro.setCliente(clienteGanador);
            
            List<MetodoPago> pagos = metodoPagoRepository.findByPersonaIdentificador(clienteGanador.getIdentificador());
            if (!pagos.isEmpty()) {
                registro.setMetodoPago(pagos.get(0));
            } else {
                // Crear un método de pago ficticio para evitar fallar la finalización si el ganador no tiene métodos registrados
                MetodoPago metodoFicticio = new MetodoPago();
                metodoFicticio.setPersona(clienteGanador);
                metodoPagoRepository.save(metodoFicticio);
                registro.setMetodoPago(metodoFicticio);
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
            notificacion.setFecha(java.time.LocalDateTime.now());
            guardarNotificacionSiNoExiste(notificacion);
        } else {
            // Regla TPO: Si nadie puja por un artículo, la empresa compra el mismo por el valor base al finalizar
            item.setSubastado("si");
            guardado = itemCatalogoRepository.save(item);
        }

        // Regla: La subasta al no tener mas objetos no subastados, debera terminar sin importar cuanto tiempo restante quede.
        Subasta subasta = guardado.getCatalogo().getSubasta();
        if (subasta != null) {
            List<ItemCatalogo> itemsEnCatalogo = itemCatalogoRepository.findByCatalogoSubastaIdentificador(subasta.getIdentificador());
            boolean todosSubastados = itemsEnCatalogo.stream()
                    .allMatch(it -> "si".equalsIgnoreCase(it.getSubastado()));
            if (todosSubastados) {
                subasta.setEstado("finalizada");
                subastaRepository.save(subasta);
            }
        }

        return guardado;
    }

    private void guardarNotificacionSiNoExiste(Notificacion notif) {
        if (notif.getPersonaId() == null) return;
        List<Notificacion> existencias = notificacionRepository.findByPersonaIdOrderByFechaDesc(notif.getPersonaId());
        boolean yaExiste = existencias.stream()
                .anyMatch(n -> notif.getAccion() != null && notif.getAccion().equals(n.getAccion()));
        if (!yaExiste) {
            notificacionRepository.save(notif);
        }
    }
}
