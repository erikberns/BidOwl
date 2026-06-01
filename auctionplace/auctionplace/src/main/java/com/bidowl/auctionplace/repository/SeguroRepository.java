package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.Seguro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeguroRepository extends JpaRepository<Seguro, String> {
}
