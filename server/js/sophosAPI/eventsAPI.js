var express = require("express");
const { authProp, Authenticate } = require("./auth");
const { getRequest } = require("../helper/request");
var router = express.Router();

router.get("/", async (req, res) => {
  const URL = `https://api-${authProp.dataRegion}.central.sophos.com/siem/v1/events`;
  getRequest(URL, res);
});

module.exports = router;
