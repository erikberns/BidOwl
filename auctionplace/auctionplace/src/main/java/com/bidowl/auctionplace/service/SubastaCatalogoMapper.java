package com.bidowl.auctionplace.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.bidowl.auctionplace.dto.ItemCatalogoDTO;
import com.bidowl.auctionplace.dto.ItemPreviewDTO;
import com.bidowl.auctionplace.dto.SubastaDetalleDTO;
import com.bidowl.auctionplace.entity.Duenio;
import com.bidowl.auctionplace.entity.ItemCatalogo;
import com.bidowl.auctionplace.entity.Producto;
import com.bidowl.auctionplace.entity.Subasta;
import com.bidowl.auctionplace.entity.Subastador;

@Component
public class SubastaCatalogoMapper {

    public SubastaDetalleDTO toDetalle(Subasta subasta, List<ItemCatalogo> items) {
        SubastaDetalleDTO dto = new SubastaDetalleDTO();
        dto.setId(subasta.getIdentificador().toString());
        dto.setTitulo(subasta.getTitulo() != null ? subasta.getTitulo() : "Subasta " + subasta.getIdentificador());
        dto.setDescripcion(subasta.getDescripcion());
        dto.setImagenPortada("/api/subastas/" + subasta.getIdentificador() + "/foto");
        dto.setRematador(nombreRematador(subasta.getSubastador()));
        dto.setUbicacion(subasta.getUbicacion() != null ? subasta.getUbicacion() : "Por definir");
        dto.setDireccionDetallada(subasta.getDireccionDetallada() != null ? subasta.getDireccionDetallada() : "Ubicado en la dirección indicada por la organización de remates.");
        dto.setFecha(subasta.getFecha() != null ? subasta.getFecha().toString() : "");
        dto.setHora(subasta.getHora() != null ? subasta.getHora().toString() : "");
        dto.setCategoria(subasta.getCategoria());
        dto.setMoneda(subasta.getMoneda() != null ? subasta.getMoneda() : MonedaService.PESOS);
        dto.setEstado(subasta.getEstado());
        dto.setCantidadTotalitems(items.size());
        dto.setPrevisualizacionitems(items.stream()
                .limit(5)
                .map(this::toPreview)
                .collect(Collectors.toList()));
        return dto;
    }

    public ItemCatalogoDTO toItemCatalogoDto(ItemCatalogo item) {
        ItemCatalogoDTO dto = new ItemCatalogoDTO();
        dto.setIditem(item.getIdentificador().toString());
        dto.setNombre(nombreProducto(item));
        dto.setValorBase(item.getPrecioBase());
        dto.setImagen(imagenProducto(item));

        Producto producto = item.getProducto();
        if (producto != null) {
            dto.setProductoId(producto.getIdentificador());
            dto.setDuenioNombre(nombreDuenio(producto.getDuenio()));
            dto.setDuenioId(producto.getDuenio() != null ? producto.getDuenio().getIdentificador() : null);
            dto.setDescripcion(descripcionProducto(producto));
        } else {
            dto.setDuenioNombre("Dueño Desconocido");
            dto.setDescripcion("");
        }

        dto.setSubastado(item.getSubastado());
        return dto;
    }

    private ItemPreviewDTO toPreview(ItemCatalogo item) {
        ItemPreviewDTO preview = new ItemPreviewDTO();
        preview.setIditem(item.getIdentificador().toString());
        preview.setNombre(nombreProducto(item));
        preview.setValorBase(item.getPrecioBase());
        preview.setImagen(imagenProducto(item));

        Producto producto = item.getProducto();
        if (producto != null) {
            preview.setDuenioNombre(nombreDuenio(producto.getDuenio()));
            preview.setDescripcion(descripcionProducto(producto));
        } else {
            preview.setDuenioNombre("Dueño Desconocido");
            preview.setDescripcion("");
        }
        return preview;
    }

    private String nombreProducto(ItemCatalogo item) {
        Producto producto = item.getProducto();
        if (producto == null) {
            return "Item " + item.getIdentificador();
        }
        if (producto.getNombre() != null && !producto.getNombre().isEmpty()) {
            return producto.getNombre();
        }
        if (producto.getDescripcionCatalogo() != null && !producto.getDescripcionCatalogo().isEmpty()) {
            return producto.getDescripcionCatalogo();
        }
        return "Item " + item.getIdentificador();
    }

    private String imagenProducto(ItemCatalogo item) {
        String nombreProducto = nombreProducto(item);
        Producto producto = item.getProducto();
        if (producto != null) {
            return "/api/productos/" + producto.getIdentificador() + "/foto";
        }
        return "https://via.placeholder.com/200x150?text=" + nombreProducto;
    }

    private String descripcionProducto(Producto producto) {
        return producto.getDescripcion() != null ? producto.getDescripcion() : producto.getDescripcionCatalogo();
    }

    private String nombreDuenio(Duenio duenio) {
        if (duenio == null) {
            return "Dueño Desconocido";
        }
        String nombre = duenio.getNombre() != null ? duenio.getNombre() : "";
        String apellido = duenio.getApellido() != null ? duenio.getApellido() : "";
        return (nombre + " " + apellido).trim();
    }

    private String nombreRematador(Subastador subastador) {
        if (subastador == null) {
            return "Rematador Desconocido";
        }
        String nombre = subastador.getNombre() != null ? subastador.getNombre() : "";
        String apellido = subastador.getApellido() != null ? subastador.getApellido() : "";
        String completo = (nombre + " " + apellido).trim();
        return completo.isEmpty() ? "Rematador Desconocido" : completo;
    }
}
