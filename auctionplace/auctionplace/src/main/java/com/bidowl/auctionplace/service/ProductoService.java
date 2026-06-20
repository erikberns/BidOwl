package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.dto.ProductoDTO;
import com.bidowl.auctionplace.entity.*;
import com.bidowl.auctionplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private DuenioRepository duenioRepository;

    @Autowired
    private SeguroRepository seguroRepository;

    @Autowired
    private FotoRepository fotoRepository;

    @Autowired
    private NotificacionRepository notificacionRepository;

    /**
     * Obtiene todos los productos
     */
    public List<ProductoDTO> obtenerTodos() {
        return productoRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un producto por ID
     */
    public ProductoDTO obtenerPorId(Integer id) throws Exception {
        Optional<Producto> producto = productoRepository.findById(id);
        if (producto.isEmpty()) {
            throw new Exception("Producto no encontrado con ID: " + id);
        }
        return convertToDTO(producto.get());
    }

    /**
     * Obtiene todos los productos disponibles
     */
    public List<ProductoDTO> obtenerDisponibles() {
        return productoRepository.findByDisponible("si")
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene todos los productos de un dueño
     */
    public List<ProductoDTO> obtenerPorDuenio(Integer duenioId) throws Exception {
        if (!duenioRepository.existsById(duenioId)) {
            throw new Exception("Dueño no encontrado con ID: " + duenioId);
        }
        
        return productoRepository.findByDuenioIdentificador(duenioId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Crea un nuevo producto
     */
    public ProductoDTO crearProducto(ProductoDTO productoDTO) throws Exception {
        // Validar que el revisor existe
        Optional<Empleado> revisor = empleadoRepository.findById(productoDTO.getRevisorId());
        if (revisor.isEmpty()) {
            throw new Exception("Revisor no encontrado con ID: " + productoDTO.getRevisorId());
        }

        // Validar que el dueño existe
        Optional<Duenio> duenio = duenioRepository.findById(productoDTO.getDuenioId());
        if (duenio.isEmpty()) {
            throw new Exception("Dueño no encontrado con ID: " + productoDTO.getDuenioId());
        }

        // Validar descripción completa
        if (productoDTO.getDescripcionCompleta() == null || productoDTO.getDescripcionCompleta().isEmpty()) {
            throw new Exception("La descripción completa es requerida");
        }

        Producto producto = new Producto();
        producto.setFecha(productoDTO.getFecha() != null ? productoDTO.getFecha() : LocalDate.now());
        producto.setDisponible(productoDTO.getDisponible() != null ? productoDTO.getDisponible() : "no");
        producto.setDescripcionCatalogo(productoDTO.getDescripcionCatalogo());
        producto.setDescripcionCompleta(productoDTO.getDescripcionCompleta());
        producto.setRevisor(revisor.get());
        producto.setDuenio(duenio.get());

        // Asignar seguro si existe
        if (productoDTO.getSeguroNumeroPoliza() != null && !productoDTO.getSeguroNumeroPoliza().isEmpty()) {
            Optional<Seguro> seguro = seguroRepository.findById(productoDTO.getSeguroNumeroPoliza());
            if (seguro.isPresent()) {
                producto.setSeguro(seguro.get());
            }
        }

        Producto productoGuardado = productoRepository.save(producto);
        return convertToDTO(productoGuardado);
    }

    /**
     * Actualiza un producto existente
     */
    public ProductoDTO actualizarProducto(Integer id, ProductoDTO productoDTO) throws Exception {
        Optional<Producto> productoOptional = productoRepository.findById(id);
        if (productoOptional.isEmpty()) {
            throw new Exception("Producto no encontrado con ID: " + id);
        }

        Producto producto = productoOptional.get();

        // Actualizar campos si se proporcionan
        if (productoDTO.getFecha() != null) {
            producto.setFecha(productoDTO.getFecha());
        }
        if (productoDTO.getDisponible() != null) {
            producto.setDisponible(productoDTO.getDisponible());
        }
        if (productoDTO.getDescripcionCatalogo() != null) {
            producto.setDescripcionCatalogo(productoDTO.getDescripcionCatalogo());
        }
        if (productoDTO.getDescripcionCompleta() != null) {
            producto.setDescripcionCompleta(productoDTO.getDescripcionCompleta());
        }

        // Actualizar revisor si se proporciona
        if (productoDTO.getRevisorId() != null) {
            Optional<Empleado> revisor = empleadoRepository.findById(productoDTO.getRevisorId());
            if (revisor.isEmpty()) {
                throw new Exception("Revisor no encontrado con ID: " + productoDTO.getRevisorId());
            }
            producto.setRevisor(revisor.get());
        }

        // Actualizar dueño si se proporciona
        if (productoDTO.getDuenioId() != null) {
            Optional<Duenio> duenio = duenioRepository.findById(productoDTO.getDuenioId());
            if (duenio.isEmpty()) {
                throw new Exception("Dueño no encontrado con ID: " + productoDTO.getDuenioId());
            }
            producto.setDuenio(duenio.get());
        }

        // Actualizar seguro si se proporciona
        if (productoDTO.getSeguroNumeroPoliza() != null && !productoDTO.getSeguroNumeroPoliza().isEmpty()) {
            Optional<Seguro> seguro = seguroRepository.findById(productoDTO.getSeguroNumeroPoliza());
            if (seguro.isPresent()) {
                producto.setSeguro(seguro.get());
            }
        }

        Producto productoActualizado = productoRepository.save(producto);
        return convertToDTO(productoActualizado);
    }

    /**
     * Elimina un producto
     */
    public void eliminarProducto(Integer id) throws Exception {
        Optional<Producto> producto = productoRepository.findById(id);
        if (producto.isEmpty()) {
            throw new Exception("Producto no encontrado con ID: " + id);
        }
        productoRepository.deleteById(id);
    }

    /**
     * Marca un producto como disponible
     */
    public ProductoDTO marcarComoDisponible(Integer id) throws Exception {
        Optional<Producto> productoOptional = productoRepository.findById(id);
        if (productoOptional.isEmpty()) {
            throw new Exception("Producto no encontrado con ID: " + id);
        }
        Producto producto = productoOptional.get();
        
        // El producto se mantiene como no disponible ("no") durante la negociación de la propuesta.
        // Solo pasará a estar disponible ("si") cuando el usuario acepte explícitamente la propuesta.
        producto.setDisponible("no");
        Producto actualizado = productoRepository.save(producto);
        
        if (producto.getDuenio() != null) {
            Notificacion notificacion = new Notificacion();
            notificacion.setPersonaId(producto.getDuenio().getIdentificador());
            notificacion.setTitulo("Artículo aceptado");
            notificacion.setCuerpo("Su artículo '" + (producto.getDescripcionCompleta() != null ? producto.getDescripcionCompleta() : "ID " + producto.getIdentificador()) + "' ha pasado la inspección física.");
            notificacion.setAccion("show_inspection_result:" + producto.getIdentificador());
            notificacion.setLeida(false);
            notificacion.setFecha(java.time.LocalDateTime.now());
            notificacionRepository.save(notificacion);
        }

        return convertToDTO(actualizado);
    }

    /**
     * Marca un producto como no disponible
     */
    public ProductoDTO marcarComoNoDisponible(Integer id) throws Exception {
        Optional<Producto> productoOptional = productoRepository.findById(id);
        if (productoOptional.isEmpty()) {
            throw new Exception("Producto no encontrado con ID: " + id);
        }
        Producto producto = productoOptional.get();
        producto.setDisponible("no");
        Producto actualizado = productoRepository.save(producto);

        if (producto.getDuenio() != null) {
            Notificacion notificacion = new Notificacion();
            notificacion.setPersonaId(producto.getDuenio().getIdentificador());
            notificacion.setTitulo("Artículo rechazado");
            notificacion.setCuerpo("Su artículo '" + (producto.getDescripcionCompleta() != null ? producto.getDescripcionCompleta() : "ID " + producto.getIdentificador()) + "' ha sido marcado como no disponible.");
            notificacion.setAccion("show_inspection_rejected:" + producto.getIdentificador());
            notificacion.setLeida(false);
            notificacion.setFecha(java.time.LocalDateTime.now());
            notificacionRepository.save(notificacion);
        }

        return convertToDTO(actualizado);
    }

    /**
     * Convierte una entidad Producto a ProductoDTO
     */
    private ProductoDTO convertToDTO(Producto producto) {
        ProductoDTO dto = new ProductoDTO();
        dto.setIdentificador(producto.getIdentificador());
        dto.setFecha(producto.getFecha());
        dto.setDisponible(producto.getDisponible());
        dto.setDescripcionCatalogo(producto.getDescripcionCatalogo());
        dto.setDescripcionCompleta(producto.getDescripcionCompleta());
        
        if (producto.getRevisor() != null) {
            dto.setRevisorId(producto.getRevisor().getIdentificador());
            dto.setRevisorNombre(producto.getRevisor().getCargo());
        }
        
        if (producto.getDuenio() != null) {
            dto.setDuenioId(producto.getDuenio().getIdentificador());
            // Duenio extiende Persona, así que acceso directo a getNombre()
            dto.setDuenioNombre(producto.getDuenio().getNombre());
        }
        
        if (producto.getSeguro() != null) {
            dto.setSeguroNumeroPoliza(producto.getSeguro().getNroPoliza());
        }
        
        dto.setNombre(producto.getNombre());
        dto.setDescripcion(producto.getDescripcion());
        
        return dto;
    }

    public byte[] obtenerPrimerFotoBytes(Integer productoId) {
        List<Foto> fotos = fotoRepository.findByProductoId(productoId);
        if (fotos != null && !fotos.isEmpty()) {
            return fotos.get(0).getFoto();
        }
        return null;
    }

    public java.util.Map<String, Object> obtenerSeguroProducto(Integer id) throws Exception {
        Optional<Producto> productoOpt = productoRepository.findById(id);
        if (productoOpt.isEmpty()) {
            throw new Exception("Producto no encontrado con ID: " + id);
        }
        Producto p = productoOpt.get();
        if (p.getSeguro() == null) {
            throw new Exception("El producto no posee un seguro contratado.");
        }
        Seguro s = p.getSeguro();
        java.util.HashMap<String, Object> response = new java.util.HashMap<>();
        response.put("nroPoliza", s.getNroPoliza());
        response.put("compania", s.getCompania());
        response.put("polizaCombinada", s.getPolizaCombinada());
        response.put("importe", s.getImporte());
        response.put("ubicacionDeposito", "Depósito Central BidOwl Pilar, Estantería B4");
        return response;
    }
}
