package main

import (
  "log"
  "net/http"

  "github.com/goji/httpauth"
  "github.com/gorilla/mux"
  "github.com/loganwilliams/glenecho/server/core"
)

func main() {
  app := core.NewServer()
  app.Setup()

  r := mux.NewRouter()
  r.HandleFunc("/log", app.LogHandler).
    Methods("POST")
  r.Use(httpauth.SimpleBasicAuth(app.Config.Auth.Username, app.Config.Auth.Password))

  http.Handle("/", r)

  log.Fatal(http.ListenAndServe(":8080", nil))

  defer app.DB.Close()
}
