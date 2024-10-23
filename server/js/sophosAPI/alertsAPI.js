var express = require("express");
const { getRequest } = require("../helper/request");
const { authProp, Authenticate } = require("./auth");
var router = express.Router();

router.get("/", async (req, res) => {
  const URL = `https://api-${authProp.dataRegion}.central.sophos.com/siem/v1/alerts`;
  getRequest(URL, res);
});

module.exports = router;
