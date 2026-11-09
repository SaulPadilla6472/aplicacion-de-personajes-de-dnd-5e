package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"time"
)

type RollRequest struct {
	StatName string `json:"statName"`
	Modifier int    `json:"modifier"`
	Count    int    `json:"count"` // Cantidad de dados a tirar en simulaciones masivas
}

type RollDetail struct {
	Roll  int `json:"roll"`
	Total int `json:"total"`
}

type RollResponse struct {
	StatName           string       `json:"statName"`
	Modifier           int          `json:"modifier"`
	TotalRolls         int          `json:"totalRolls"`
	CriticalSuccesses int          `json:"criticalSuccesses"`
	CriticalFailures  int          `json:"criticalFailures"`
	AverageTotal       float64      `json:"averageTotal"`
	Details            []RollDetail `json:"details"`
}

func rollHandler(w http.ResponseWriter, r *http.Request) {
	// Configurar headers CORS básicos
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var req RollRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil || req.Count <= 0 {
		req.Count = 1 // Valor por defecto si no se especifica la cantidad
	}

	rand.Seed(time.Now().UnixNano())

	critSuccess := 0
	critFail := 0
	sumTotal := 0
	details := make([]RollDetail, req.Count)

	for i := 0; i < req.Count; i++ {
		roll := rand.Intn(20) + 1
		total := roll + req.Modifier

		if roll == 20 {
			critSuccess++
		} else if roll == 1 {
			critFail++
		}

		sumTotal += total
		details[i] = RollDetail{
			Roll:  roll,
			Total: total,
		}
	}

	avg := float64(sumTotal) / float64(req.Count)

	resp := RollResponse{
		StatName:           req.StatName,
		Modifier:           req.Modifier,
		TotalRolls:         req.Count,
		CriticalSuccesses: critSuccess,
		CriticalFailures:  critFail,
		AverageTotal:       avg,
		Details:            details,
	}

	json.NewEncoder(w).Encode(resp)
}

func main() {
	http.HandleFunc("/api/go/roll", rollHandler)
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"OK","service":"simulator-go"}`))
	})

	port := ":8080"
	fmt.Printf("⚡ Microservicio Go de tiradas de dados corriendo en http://localhost%s\n", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		fmt.Printf("Error iniciando el servidor Go: %v\n", err)
	}
}