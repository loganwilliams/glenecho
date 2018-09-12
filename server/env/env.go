package env

import (
  "github.com/caarlos0/env"
  "log"
)

const (
  DB_DRIVER = "postgres"
)

type Config struct {
  DB   DB
  Auth Auth
}

type DB struct {
  Host     string `env:"DBHOST" envDefault:"localhost"`
  Username string `env:"DBUSER" envDefault:"loganw"`
  Password string `env:"DBPASS" envDefault:"\"\""`
  Name     string `env:"DBNAME" envDefault:"glenecho"`
}

type Auth struct {
  Username string `env:"USERNAME" envDefault:"admin"`
  Password string `env:"PASSWORD" envDefault:"god"`
}

func NewConfig() *Config {
  conf := &Config{}

  err := env.Parse(&conf.DB)
  if err != nil {
    log.Panic("Error parsing DB config environment variables", err)
  }

  err = env.Parse(&conf.Auth)
  if err != nil {
    log.Panic("Error parsing Auth config environment variables", err)
  }

  return conf
}

type TestConfig struct {
  DB TestDB
}

type TestDB struct {
  Host     string `env:"TEST_DBHOST" envDefault:"localhost"`
  Username string `env:"TEST_DBUSER" envDefault:"loganw"`
  Password string `env:"TEST_DBPASS" envDefault:"\"\""`
  Name     string `env:"TEST_DBNAME" envDefault:"glenecho_test"`
}

func NewTestConfig() *TestConfig {
  conf := &TestConfig{}

  // parse server conf
  err := env.Parse(&conf.DB)
  if err != nil {
    log.Panic("Error parsing test DB config environment variables", err)
  }

  return conf
}
