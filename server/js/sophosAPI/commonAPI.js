var express = require("express");
const { getRequest } = require("../helper/request");
const { authProp, Authenticate } = require("./auth");
var router = express.Router();

router.get("/", async (req, res) => {
  res.status(400).send("service not mentioned");
});

router.get("/users", async (req, res) => {
  const URL = `https://api-${authProp.dataRegion}.central.sophos.com/common/v1/directory/users`;
  getRequest(URL, res);
});

module.exports = router;
