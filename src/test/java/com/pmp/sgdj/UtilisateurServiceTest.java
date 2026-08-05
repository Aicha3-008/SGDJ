package com.pmp.sgdj;

import com.pmp.sgdj.service.UtilisateurService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class UtilisateurServiceTest {

    @Autowired
    private UtilisateurService utilisateurService;

    @Test
    void serviceIsCreated() {
        assertNotNull(utilisateurService);
    }
}
