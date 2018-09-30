package core

import (
  "encoding/json"
  "log"
  "net/http"
  "time"

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
