package core

import (
  "encoding/json"
  "log"
  "net/http"

  "github.com/loganwilliams/glenecho/server/types"
)

func (s *Server) LogHandler(w http.ResponseWriter, r *http.Request) {
  decoder := json.NewDecoder(r.Body)
  var t types.Datapoint
  err := decoder.Decode(&t)
  if err != nil {
    log.Println(err)
  }

  log.Println(t)

  t.Insert(s.DB)
}
