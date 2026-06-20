package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.entity.*;
import com.bidowl.auctionplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class PujoService {

    @Autowired
    private PujoRepository pujoRepository;

    @Autowired
    private AsistenteRepository asistenteRepository;

    @Autowired
    private ItemCatalogoRepository itemCatalogoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    public List<Pujo> obtenerHistorial(Integer itemId) {
        return pujoRepository.findByItemIdentificadorOrderByImporteDesc(itemId);
    }

    public Optional<Pujo> obtenerPujaMaxima(Integer itemId) {
        return pujoRepository.findFirstByItemIdentificadorOrderByImporteDesc(itemId);
    }

    public Pujo registrarPuja(Integer asistenteId, Integer itemId, BigDecimal importe) throws Exception {
        Asistente asistente = asistenteRepository.findById(asistenteId)
                .orElseThrow(() -> new Exception("Asistente no registrado en esta subasta."));
        
        ItemCatalogo item = itemCatalogoRepository.findById(itemId)
                .orElseThrow(() -> new Exception("Artículo del catálogo no encontrado."));

        if (item.getProducto().getDuenio().getIdentificador().equals(asistente.getCliente().getIdentificador())) {
            throw new Exception("No puedes pujar por un artículo de tu propiedad.");
        }

        if ("si".equalsIgnoreCase(item.getSubastado())) {
            throw new Exception("El artículo ya ha sido subastado.");
        }

        BigDecimal precioBase = item.getPrecioBase();
        Optional<Pujo> ultimaPujaOpt = pujoRepository.findFirstByItemIdentificadorOrderByImporteDesc(itemId);

        if (ultimaPujaOpt.isPresent()) {
            Pujo ultimaPuja = ultimaPujaOpt.get();
            BigDecimal montoUltima = ultimaPuja.getImporte();

            // Validar que sea mayor a la última puja
            if (importe.compareTo(montoUltima) <= 0) {
                throw new Exception("El importe ofertado debe ser mayor a la oferta líder actual de $" + montoUltima);
            }

            // Validar límites si la subasta NO es de categoría 'oro' o 'platino'
            String catSubasta = item.getCatalogo().getSubasta().getCategoria();
            boolean esCategoriaAlta = "oro".equalsIgnoreCase(catSubasta) || "platino".equalsIgnoreCase(catSubasta);

            if (!esCategoriaAlta) {
                BigDecimal incrementoMinimo = precioBase.multiply(BigDecimal.valueOf(0.01)); // 1% del valor base
                BigDecimal incrementoMaximo = precioBase.multiply(BigDecimal.valueOf(0.20)); // 20% del valor base

                BigDecimal pujaMinimaRequerida = montoUltima.add(incrementoMinimo);
                BigDecimal pujaMaximaPermitida = montoUltima.add(incrementoMaximo);

                if (importe.compareTo(pujaMinimaRequerida) < 0) {
                    throw new Exception("Incremento insuficiente. Para subastas de categoría " + catSubasta + 
                                        ", la puja mínima debe ser de $" + pujaMinimaRequerida + 
                                        " (oferta actual + 1% del precio base de $" + precioBase + ")");
                }

                if (importe.compareTo(pujaMaximaPermitida) > 0) {
                    throw new Exception("Incremento excedido. Para subastas de categoría " + catSubasta + 
                                        ", la puja máxima permitida es de $" + pujaMaximaPermitida + 
                                        " (oferta actual + 20% del precio base de $" + precioBase + ")");
                }
            }
        } else {
            // Primera puja: debe ser al menos el precio base
            if (importe.compareTo(precioBase) < 0) {
                throw new Exception("La oferta inicial debe ser al menos el precio base de $" + precioBase);
            }
            
            String catSubasta = item.getCatalogo().getSubasta().getCategoria();
            boolean esCategoriaAlta = "oro".equalsIgnoreCase(catSubasta) || "platino".equalsIgnoreCase(catSubasta);
            
            if (!esCategoriaAlta) {
                BigDecimal incrementoMaximo = precioBase.multiply(BigDecimal.valueOf(0.20));
                BigDecimal pujaMaximaPermitida = precioBase.add(incrementoMaximo);
                if (importe.compareTo(pujaMaximaPermitida) > 0) {
                    throw new Exception("La oferta inicial no puede superar el precio base más el 20% ($" + pujaMaximaPermitida + ")");
                }
            }
        }

        // Registrar la puja
        Pujo nuevaPuja = new Pujo();
        nuevaPuja.setAsistente(asistente);
        nuevaPuja.setItem(item);
        nuevaPuja.setImporte(importe);
        nuevaPuja.setGanador("no");
        nuevaPuja.setFechaHora(java.time.LocalDateTime.now());

        Pujo guardada = pujoRepository.save(nuevaPuja);

        // Incrementar métrica del cliente
        Cliente cliente = asistente.getCliente();
        cliente.setPujasRealizadas(cliente.getPujasRealizadas() + 1);
        clienteRepository.save(cliente);

        return guardada;
    }
}
