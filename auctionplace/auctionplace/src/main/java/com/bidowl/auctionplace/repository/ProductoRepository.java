package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    List<Producto> findByDisponible(String disponible);
    List<Producto> findByDuenioIdentificador(Integer duenioId);
}
