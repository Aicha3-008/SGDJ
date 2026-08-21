package com.pmp.sgdj.repository;

import com.pmp.sgdj.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByDossierIdOrderByDateAjoutDesc(Long dossierId);
}