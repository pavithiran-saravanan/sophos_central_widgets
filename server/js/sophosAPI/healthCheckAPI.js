var express = require("express");
const { authProp, Authenticate } = require("./auth");
const { getRequest } = require("../helper/request");
var router = express.Router();

router.get("/", async (req, res) => {
  const URL = `https://api-${authProp.dataRegion}.central.sophos.com/account-health-check/v1/health-check`;
  getRequest(URL, res);
});

module.exports = router;
