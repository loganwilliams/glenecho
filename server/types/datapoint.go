package types

import (
  "database/sql"
  "log"
  "time"
)

type Datapoint struct {
  Id          int       `json:"id"`
  Timestamp   time.Time `json:"timestamp"`
  Site        int       `json:"site"`
  Sensor      string    `json:"sensor"`
  Measurement string    `json:"measurement"`
  Value       float64   `json:"value"`
}

var (
  createStmt *sql.Stmt
)

func CreateAndPopulateDatapointsTable(db *sql.DB) error {
  mkTableStmt := `CREATE TABLE datapoints(
    id bigserial primary key,
    timestamp timestamptz not null,
    site int,
    sensor varchar(100),
    measurement varchar(100),
    value float
    )`

  _, err := db.Exec(mkTableStmt)
  if err != nil {
    log.Fatal("Error creating table `datapoints`", err)
  }

  return nil
}

func DropDatapointsTable(db *sql.DB) error {
  dpStmt := `DROP TABLE IF EXISTS datapoints CASCADE`
  _, err := db.Exec(dpStmt)
  if err != nil {
    log.Fatal("Error dropping table `datapoints`", err)
  }

  return nil
}

func (dp *Datapoint) Insert(db *sql.DB) error {
  var err error
  if createStmt == nil {
    stmt := `INSERT INTO datapoints(
      timestamp,
      site,
      sensor,
      measurement,
      value)
    SELECT $1, $2, $3, $4, $5`

    createStmt, err = db.Prepare(stmt)

    if err != nil {
      log.Fatal("error preparing statement,", err)
      return err
    }
  }

  _, err = createStmt.Exec(dp.Timestamp, dp.Site, dp.Sensor, dp.Measurement, dp.Value)

  if err != nil {
    log.Fatal("error inserting datapoint", err)
  }

  return err
}
