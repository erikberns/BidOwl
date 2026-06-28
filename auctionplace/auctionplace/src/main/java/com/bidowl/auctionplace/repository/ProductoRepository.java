// Consulta productos por disponibilidad, duenio y participacion en catalogos.
package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    List<Producto> findByDisponible(String disponible);

    List<Producto> findByDuenioIdentificador(Integer duenioId);

    @Query("SELECT p FROM Producto p WHERE " +
           "(p.duenio.identificador = :duenioId AND NOT EXISTS (SELECT r FROM RegistroDeSubasta r WHERE r.producto = p)) " +
           "OR p IN (SELECT r.producto FROM RegistroDeSubasta r WHERE r.duenio.identificador = :duenioId)")
    List<Producto> findProductosOriginalesPorDuenio(@Param("duenioId") Integer duenioId);
}
