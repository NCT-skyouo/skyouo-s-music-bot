const crypto = require("crypto");
const express = require("express");
const app = express();

// 驗證簽證
// 驗證時效
// 驗證sha512/md5
app.post("/api/v1/:method/:data", (req, res) => {
  switch (req.params.method) {
    case "verify":
      
      return;
    default:
      res.status(404);
  }
});