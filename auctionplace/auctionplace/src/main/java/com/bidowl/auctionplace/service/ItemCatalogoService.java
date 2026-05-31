package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.entity.*;
import com.bidowl.auctionplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
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

        if (pujaGanadoraOpt.isPresent()) {
            Pujo pujaGanadora = pujaGanadoraOpt.get();
            pujaGanadora.setGanador("si");
            pujoRepository.save(pujaGanadora);

            item.setSubastado("si");
            ItemCatalogo guardado = itemCatalogoRepository.save(item);

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
                throw new Exception("El comprador ganador no posee medios de pago registrados.");
            }

            registro.setImporte(pujaGanadora.getImporte());
            registro.setComision(item.getComision());

            registroDeSubastaRepository.save(registro);

            return guardado;
        } else {
            // Regla TPO: Si nadie puja por un artículo, la empresa compra el mismo por el valor base al finalizar
            item.setSubastado("si");
            return itemCatalogoRepository.save(item);
        }
    }
}
