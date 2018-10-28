package main

import (
  "log"
  "net/http"

  "github.com/gorilla/mux"
  "github.com/loganwilliams/glenecho/server/core"
)

func main() {
  app := core.NewServer()
  app.Setup()

  r := mux.NewRouter()
  r.HandleFunc("/log", app.LogHandler).Methods("POST")
  r.HandleFunc("/list", app.RecentListHandler).Methods("GET")
  r.HandleFunc("/list/{date}", app.ListHandler).Methods("GET")

  http.Handle("/", r)

  log.Fatal(http.ListenAndServe(":8080", nil))

  defer app.DB.Close()
}
