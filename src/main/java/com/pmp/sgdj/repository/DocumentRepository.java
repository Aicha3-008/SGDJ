package com.pmp.sgdj.repository;

import com.pmp.sgdj.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {
}
