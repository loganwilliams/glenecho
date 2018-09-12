package core

import (
  "github.com/loganwilliams/glenecho/server/types"
)

func (s *Server) Setup() error {
  types.CreateAndPopulateDatapointsTable(s.DB)

  return nil
}
