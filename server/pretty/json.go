package pretty

import (
  "bytes"
  "encoding/json"
)

func Json(in string) string {
  var out bytes.Buffer
  err := json.Indent(&out, []byte(in), "", "\t")
  if err != nil {
    return in
  }
  return out.String()
}
