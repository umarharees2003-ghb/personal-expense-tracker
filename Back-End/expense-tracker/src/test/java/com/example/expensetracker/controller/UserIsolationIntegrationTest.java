package com.example.expensetracker.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UserIsolationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void userCannotAccessModifyOrInferAnotherUsersFinancialData() throws Exception {
        // 1. Register and login User A (Alice)
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Alice Smith","email":"alice@example.com","password":"Password123!"}
                                """))
                .andExpect(status().isCreated());

        MvcResult aliceLogin = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"alice@example.com","password":"Password123!"}
                                """))
                .andExpect(status().isOk())
                .andReturn();
        String aliceToken = extractToken(aliceLogin);

        // 2. Register and login User B (Bob)
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Bob Jones","email":"bob@example.com","password":"Password123!"}
                                """))
                .andExpect(status().isCreated());

        MvcResult bobLogin = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"bob@example.com","password":"Password123!"}
                                """))
                .andExpect(status().isOk())
                .andReturn();
        String bobToken = extractToken(bobLogin);

        // 3. Alice creates a category
        MvcResult catResult = mockMvc.perform(post("/api/categories")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Alice Secret Category"}
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        long aliceCatId = objectMapper.readTree(catResult.getResponse().getContentAsString()).get("id").asLong();

        // 4. Alice creates a transaction
        MvcResult txResult = mockMvc.perform(post("/api/transactions")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(String.format("""
                                {"amount":85.00,"description":"Alice Private Transaction","date":"2026-10-15","type":"EXPENSE","categoryId":%d}
                                """, aliceCatId)))
                .andExpect(status().isCreated())
                .andReturn();
        long aliceTxId = objectMapper.readTree(txResult.getResponse().getContentAsString()).get("id").asLong();

        // 5. Bob tries to access Alice's transaction -> must be 404
        mockMvc.perform(get("/api/transactions/" + aliceTxId)
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isNotFound());

        // 6. Bob tries to update Alice's transaction -> must be 404
        mockMvc.perform(put("/api/transactions/" + aliceTxId)
                        .header("Authorization", "Bearer " + bobToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(String.format("""
                                {"amount":10.00,"description":"Bob Hack","date":"2026-10-15","type":"EXPENSE","categoryId":%d}
                                """, aliceCatId)))
                .andExpect(status().isNotFound());

        // 7. Bob tries to delete Alice's transaction -> must be 404
        mockMvc.perform(delete("/api/transactions/" + aliceTxId)
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isNotFound());

        // 8. Bob tries to access Alice's category -> must be 404
        mockMvc.perform(get("/api/categories/" + aliceCatId)
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isNotFound());

        // 9. Bob tries to update Alice's category -> must be 404
        mockMvc.perform(put("/api/categories/" + aliceCatId)
                        .header("Authorization", "Bearer " + bobToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Bob Renamed Alice Category"}
                                """))
                .andExpect(status().isNotFound());

        // 10. Bob tries to delete Alice's category -> must be 404
        mockMvc.perform(delete("/api/categories/" + aliceCatId)
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isNotFound());

        // 11. Bob tries to create a transaction using Alice's category -> must be 404
        mockMvc.perform(post("/api/transactions")
                        .header("Authorization", "Bearer " + bobToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(String.format("""
                                {"amount":40.00,"description":"Bob using Alice Cat","date":"2026-10-15","type":"EXPENSE","categoryId":%d}
                                """, aliceCatId)))
                .andExpect(status().isNotFound());

        // 12. Bob lists his transactions -> must be empty (0 items)
        MvcResult bobTxList = mockMvc.perform(get("/api/transactions")
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode bobTxArray = objectMapper.readTree(bobTxList.getResponse().getContentAsString());
        assertEquals(0, bobTxArray.size(), "Bob must not see Alice's transactions");

        // 13. Bob lists his categories -> must be empty (0 items)
        MvcResult bobCatList = mockMvc.perform(get("/api/categories")
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode bobCatArray = objectMapper.readTree(bobCatList.getResponse().getContentAsString());
        assertEquals(0, bobCatArray.size(), "Bob must not see Alice's categories");
    }

    private String extractToken(MvcResult result) throws Exception {
        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.get("token").asText();
    }
}
