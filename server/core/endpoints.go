package core

import (
  "encoding/json"
  "fmt"
  "log"
  "net/http"
  "time"

  "github.com/gorilla/mux"
  "github.com/loganwilliams/glenecho/server/pretty"
  "github.com/loganwilliams/glenecho/server/types"
)

func (s *Server) LogHandler(w http.ResponseWriter, r *http.Request) {
  decoder := json.NewDecoder(r.Body)
  var t types.Datapoint

  err := decoder.Decode(&t)
  if err != nil {
    log.Println(err)
  }

  t.Timestamp = time.Now().UTC()
  log.Println(t)
  t.Insert(s.DB)
}

func (s *Server) RecentListHandler(w http.ResponseWriter, r *http.Request) {
  w = setHeaders(w)
  data, err := types.RecentDatapoints(s.DB)

  if err != nil {
    log.Panic("error querying recent datapoints", err)
  }

  response, err := json.Marshal(data)

  if err != nil {
    log.Panic("errror marshalling JSON", err)
  }

  fmt.Fprintf(w, "%s", pretty.Json(string(response)))
}

func (s *Server) ListHandler(w http.ResponseWriter, r *http.Request) {
  vars := mux.Vars(r)
  date, err := time.Parse("2006-01-02", vars["date"])

  if err != nil {
    log.Panic("error parsing date", err)
  }

  w = setHeaders(w)
  data, err := types.DatapointsAtTime(s.DB, date)

  if err != nil {
    log.Panic("error querying recent datapoints", err)
  }

  response, err := json.Marshal(data)

  if err != nil {
    log.Panic("errror marshalling JSON", err)
  }

  fmt.Fprintf(w, "%s", pretty.Json(string(response)))
}

func setHeaders(w http.ResponseWriter) http.ResponseWriter {
  // Send the correct headers to enable CORS
  w.Header().Set("Content-Type", "text/json; charset=ascii")
  w.Header().Set("Access-Control-Allow-Origin", "*")
  w.Header().Set("Access-Control-Allow-Headers", "Content-Type,access-control-allow-origin, access-control-allow-headers")

  return w
}
