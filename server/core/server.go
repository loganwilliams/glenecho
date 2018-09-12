package core

import (
  "database/sql"
  "fmt"
  "log"
  "time"

  "github.com/loganwilliams/glenecho/server/env"

  _ "github.com/lib/pq"
)

type Server struct {
  DB     *sql.DB
  Config *env.Config
}

func NewServer() *Server {
  s := &Server{}

  s.InitDb()

  return s
}

func (s *Server) InitDb() {
  s.Config = env.NewConfig()
  var err error
  dbInfo := fmt.Sprintf("host=%s user=%s "+
    "password=%s dbname=%s sslmode=disable",
    s.Config.DB.Host, s.Config.DB.Username, s.Config.DB.Password, s.Config.DB.Name)

  log.Println("opening db connection")

  s.DB, err = sql.Open(env.DB_DRIVER, dbInfo)

  if err != nil {
    log.Println("error opening connection")
    log.Println(err)
    time.Sleep(2 * time.Second)
    s.InitDb()
  }

  err = s.DB.Ping()

  if err != nil {
    log.Println("error pinging")
    log.Println(err)
    time.Sleep(2 * time.Second)
    s.InitDb()
  }

  log.Println("Succesfully connected")
}
