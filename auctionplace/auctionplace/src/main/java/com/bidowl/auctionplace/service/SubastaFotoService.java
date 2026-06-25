package com.bidowl.auctionplace.service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bidowl.auctionplace.entity.Catalogo;
import com.bidowl.auctionplace.entity.CatalogoFoto;
import com.bidowl.auctionplace.repository.CatalogoFotoRepository;
import com.bidowl.auctionplace.repository.CatalogoRepository;

@Service
public class SubastaFotoService {

    @Autowired
    private CatalogoRepository catalogoRepository;

    @Autowired
    private CatalogoFotoRepository catalogoFotoRepository;

    public byte[] obtenerFotoSubastaBytes(Integer subastaId) {
        Optional<Catalogo> catalogoOpt = catalogoRepository.findBySubastaIdentificador(subastaId);
        if (catalogoOpt.isPresent()) {
            List<CatalogoFoto> fotos = catalogoFotoRepository.findByCatalogoId(catalogoOpt.get().getIdentificador());
            if (fotos != null && !fotos.isEmpty()) {
                return fotos.get(0).getFoto();
            }
        }
        return null;
    }

    public List<Integer> obtenerIdsFotosSubasta(Integer subastaId) {
        Optional<Catalogo> catalogoOpt = catalogoRepository.findBySubastaIdentificador(subastaId);
        if (catalogoOpt.isPresent()) {
            List<CatalogoFoto> fotos = catalogoFotoRepository.findByCatalogoId(catalogoOpt.get().getIdentificador());
            if (fotos != null) {
                return fotos.stream()
                        .map(CatalogoFoto::getIdentificador)
                        .collect(Collectors.toList());
            }
        }
        return Collections.emptyList();
    }

    public byte[] obtenerFotoSubastaBytesPorId(Integer fotoId) {
        return catalogoFotoRepository.findById(fotoId)
                .map(CatalogoFoto::getFoto)
                .orElse(null);
    }

    @Transactional
    public void guardarFotoCatalogo(Integer catalogoId, byte[] fotoBytes) {
        if (catalogoId == null || fotoBytes == null) {
            return;
        }
        catalogoRepository.findById(catalogoId).ifPresent(catalogo -> guardarFotoCatalogo(catalogo, fotoBytes));
    }

    @Transactional
    public void guardarFotoCatalogo(Catalogo catalogo, byte[] fotoBytes) {
        if (catalogo == null || fotoBytes == null) {
            return;
        }
        CatalogoFoto foto = new CatalogoFoto();
        foto.setCatalogo(catalogo);
        foto.setFoto(fotoBytes);
        catalogoFotoRepository.save(foto);
    }

    @Transactional
    public void guardarFotoSubasta(Integer subastaId, byte[] fotoBytes) {
        Optional<Catalogo> catalogoOpt = catalogoRepository.findBySubastaIdentificador(subastaId);
        catalogoOpt.ifPresent(catalogo -> guardarFotoCatalogo(catalogo, fotoBytes));
    }
}
