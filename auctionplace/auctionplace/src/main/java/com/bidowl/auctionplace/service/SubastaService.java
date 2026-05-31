package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.entity.*;
import com.bidowl.auctionplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class SubastaService {

    @Autowired
    private SubastaRepository subastaRepository;

    @Autowired
    private ItemCatalogoRepository itemCatalogoRepository;

    @Autowired
    private AsistenteRepository asistenteRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private MetodoPagoRepository metodoPagoRepository;

    public List<Subasta> obtenerTodas() {
        return subastaRepository.findAll();
    }

    public List<Subasta> obtenerPorEstado(String estado) {
        return subastaRepository.findByEstado(estado);
    }

    public Subasta obtenerPorId(Integer id) throws Exception {
        return subastaRepository.findById(id)
                .orElseThrow(() -> new Exception("Subasta no encontrada con el identificador: " + id));
    }

    public List<ItemCatalogo> obtenerCatalogo(Integer subastaId) {
        return itemCatalogoRepository.findByCatalogoSubastaIdentificador(subastaId);
    }

    public Asistente unirseASubasta(Integer clienteId, Integer subastaId) throws Exception {
        Subasta subasta = obtenerPorId(subastaId);
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new Exception("Cliente no encontrado con el identificador: " + clienteId));

        // 1. Validar categoría
        if (getCategoryRank(cliente.getCategoriaCliente()) < getCategoryRank(subasta.getCategoria())) {
            throw new Exception("Tu categoría (" + cliente.getCategoriaCliente() + 
                                ") es inferior a la categoría requerida para esta subasta (" + subasta.getCategoria() + ").");
        }

        // 2. Validar que tenga al menos un método de pago
        List<MetodoPago> pagos = metodoPagoRepository.findByPersonaIdentificador(clienteId);
        if (pagos.isEmpty()) {
            throw new Exception("Debes registrar al menos un medio de pago verificado antes de unirte a una subasta.");
        }

        // 3. Si ya es asistente, retornar existente
        Optional<Asistente> existente = asistenteRepository.findByClienteIdentificadorAndSubastaIdentificador(clienteId, subastaId);
        if (existente.isPresent()) {
            return existente.get();
        }

        // 4. Crear asistente
        Asistente nuevoAsistente = new Asistente();
        nuevoAsistente.setCliente(cliente);
        nuevoAsistente.setSubasta(subasta);
        // Generar número de postor secuencial/aleatorio para la demo
        int numeroPostor = (int) (Math.random() * 9000) + 1000;
        nuevoAsistente.setNumeroPostor(numeroPostor);

        // Actualizar estadísticas de la persona
        cliente.setRematesAsistidos(cliente.getRematesAsistidos() + 1);
        clienteRepository.save(cliente);

        return asistenteRepository.save(nuevoAsistente);
    }

    private int getCategoryRank(String cat) {
        if (cat == null) return 0;
        switch (cat.toLowerCase()) {
            case "comun": return 1;
            case "especial": return 2;
            case "plata": return 3;
            case "oro": return 4;
            case "platino": return 5;
            default: return 0;
        }
    }
}
