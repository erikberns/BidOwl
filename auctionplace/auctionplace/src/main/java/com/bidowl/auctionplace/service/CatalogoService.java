package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.dto.*;
import com.bidowl.auctionplace.entity.*;
import com.bidowl.auctionplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.Optional;

@Service
public class CatalogoService {

    @Autowired
    private CatalogoRepository catalogoRepository;

    @Autowired
    private ItemCatalogoRepository itemCatalogoRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private PropuestaComercialRepository propuestaComercialRepository;

    @Autowired
    private FotoRepository fotoRepository;

    @Transactional
    public Catalogo crearCatalogo(CatalogoCrearRequest request) {
        Empleado responsable = null;
        if (request.getResponsableId() != null) {
            responsable = empleadoRepository.findById(request.getResponsableId())
                    .orElseThrow(() -> new java.util.NoSuchElementException("Empleado responsable no encontrado con ID: " + request.getResponsableId()));
        } else {
            responsable = empleadoRepository.findById(1)
                    .orElseThrow(() -> new java.util.NoSuchElementException("No hay empleados disponibles por defecto."));
        }

        Catalogo catalogo = new Catalogo();
        catalogo.setDescripcion(request.getDescripcion() != null ? request.getDescripcion() : "Catálogo");
        catalogo.setResponsable(responsable);

        Catalogo catalogoGuardado = catalogoRepository.save(catalogo);

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (ItemCatalogoCrearRequest itemReq : request.getItems()) {
                Producto producto = productoRepository.findById(itemReq.getProductoId())
                        .orElseThrow(() -> new java.util.NoSuchElementException("Producto no encontrado con ID: " + itemReq.getProductoId()));

                if (!"si".equalsIgnoreCase(producto.getDisponible())) {
                    throw new IllegalStateException("El producto con ID " + itemReq.getProductoId() + " no está disponible.");
                }

                PropuestaComercial propuesta = propuestaComercialRepository.findByProducto(producto)
                        .orElse(null);

                BigDecimal precioBase = itemReq.getPrecioBase();
                if (precioBase == null) {
                    if (propuesta != null) {
                        precioBase = propuesta.getValorBase();
                    } else {
                        throw new IllegalArgumentException("Debe especificar el precio base o tener una propuesta comercial registrada para el producto ID: " + itemReq.getProductoId());
                    }
                }

                BigDecimal comision = itemReq.getComision();
                if (comision == null) {
                    if (propuesta != null) {
                        comision = propuesta.getComision();
                    } else {
                        throw new IllegalArgumentException("Debe especificar la comisión o tener una propuesta comercial registrada para el producto ID: " + itemReq.getProductoId());
                    }
                }

                java.time.LocalDateTime fechaFinPuja = null;
                if (itemReq.getFechaFinPuja() != null && !itemReq.getFechaFinPuja().isEmpty()) {
                    try {
                        fechaFinPuja = java.time.LocalDateTime.parse(itemReq.getFechaFinPuja().replace(" ", "T"));
                    } catch (Exception e) {
                        throw new IllegalArgumentException("Formato de fecha de fin de puja inválido. Debe ser yyyy-MM-dd HH:mm:ss.");
                    }
                }

                ItemCatalogo item = new ItemCatalogo();
                item.setCatalogo(catalogoGuardado);
                item.setProducto(producto);
                item.setPrecioBase(precioBase);
                item.setComision(comision);
                item.setSubastado("no");
                item.setFechaFinPuja(fechaFinPuja);

                itemCatalogoRepository.save(item);
            }
        }

        return catalogoGuardado;
    }

    @Transactional
    public Catalogo guardarFotoCatalogo(Integer catalogoId, byte[] fotoBytes) {
        guardarFotosCatalogo(catalogoId, java.util.Collections.singletonList(fotoBytes));
        return catalogoRepository.findById(catalogoId).orElse(null);
    }

    @Transactional
    public void guardarFotosCatalogo(Integer catalogoId, java.util.List<byte[]> fotosBytes) {
        Catalogo catalogo = catalogoRepository.findById(catalogoId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Catálogo no encontrado con ID: " + catalogoId));
        
        for (byte[] bytes : fotosBytes) {
            Foto foto = new Foto();
            foto.setCatalogo(catalogo);
            foto.setFoto(bytes);
            fotoRepository.save(foto);
        }

        // Si la foto directa en el catálogo es nula, le asignamos la primera
        if (catalogo.getFoto() == null && !fotosBytes.isEmpty()) {
            catalogo.setFoto(fotosBytes.get(0));
            catalogoRepository.save(catalogo);
        }
    }

    public byte[] obtenerFotoCatalogoBytes(Integer catalogoId) {
        Optional<Catalogo> catalogo = catalogoRepository.findById(catalogoId);
        if (catalogo.isPresent()) {
            if (catalogo.get().getFoto() != null) {
                return catalogo.get().getFoto();
            }
            java.util.List<Foto> fotos = fotoRepository.findByCatalogoId(catalogoId);
            if (fotos != null && !fotos.isEmpty()) {
                return fotos.get(0).getFoto();
            }
        }
        return null;
    }
}
