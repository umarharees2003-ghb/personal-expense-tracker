package com.example.expensetracker.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TransactionPaginationSortingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void transactionsCanBeSortedAndPaged() throws Exception {
        // Register and login test user
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Paging Tester","email":"paging@example.com","password":"Password123!"}
                                """))
                .andExpect(status().isCreated());

        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"paging@example.com","password":"Password123!"}
                                """))
                .andExpect(status().isOk())
                .andReturn();
        String token = objectMapper.readTree(login.getResponse().getContentAsString()).get("token").asText();

        // Create 3 income transactions with different amounts and dates
        createTx(token, 10.00, "Smallest amount", "2026-10-01", "INCOME");
        createTx(token, 100.00, "Largest amount", "2026-10-05", "INCOME");
        createTx(token, 50.00, "Medium amount", "2026-10-10", "INCOME");

        // Test sorting by amount descending
        MvcResult sortAmtDesc = mockMvc.perform(get("/api/transactions?sortBy=amount&sortDirection=desc")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode arrDesc = objectMapper.readTree(sortAmtDesc.getResponse().getContentAsString());
        assertEquals(3, arrDesc.size());
        assertEquals(100.00, arrDesc.get(0).get("amount").asDouble());
        assertEquals(50.00, arrDesc.get(1).get("amount").asDouble());
        assertEquals(10.00, arrDesc.get(2).get("amount").asDouble());

        // Test sorting by amount ascending
        MvcResult sortAmtAsc = mockMvc.perform(get("/api/transactions?sortBy=amount&sortDirection=asc")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode arrAsc = objectMapper.readTree(sortAmtAsc.getResponse().getContentAsString());
        assertEquals(10.00, arrAsc.get(0).get("amount").asDouble());
        assertEquals(50.00, arrAsc.get(1).get("amount").asDouble());
        assertEquals(100.00, arrAsc.get(2).get("amount").asDouble());

        // Test pagination endpoint: page size 2
        mockMvc.perform(get("/api/transactions/paged?page=0&size=2&sortBy=amount&sortDirection=desc")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(2))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").value(false))
                .andExpect(jsonPath("$.content[0].amount").value(100.00))
                .andExpect(jsonPath("$.content[1].amount").value(50.00));

        // Page 1 (second page)
        mockMvc.perform(get("/api/transactions/paged?page=1&size=2&sortBy=amount&sortDirection=desc")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.first").value(false))
                .andExpect(jsonPath("$.last").value(true))
                .andExpect(jsonPath("$.content[0].amount").value(10.00));
    }

    private void createTx(String token, double amount, String desc, String date, String type) throws Exception {
        mockMvc.perform(post("/api/transactions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(String.format("""
                                {"amount":%.2f,"description":"%s","date":"%s","type":"%s"}
                                """, amount, desc, date, type)))
                .andExpect(status().isCreated());
    }
}
