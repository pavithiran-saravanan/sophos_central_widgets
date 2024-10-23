var express = require("express");
const { authProp, Authenticate } = require("./auth");
const {
  getRequest,
  patchRequest,
  deleteRequest,
  postRequest,
} = require("../helper/request");
var router = express.Router();

router.get("/", function (req, res) {
  const URL = `https://api-${authProp.dataRegion}.central.sophos.com/endpoint/v1/endpoints`;
  getRequest(URL, res);
});

router.get("/isolate", async (req, res) => {
  const { id } = req.query;
  const URL = `https://api-${authProp.dataRegion}.central.sophos.com/endpoint/v1/endpoints/${id}/isolation`;

  getRequest(URL, res);
});

router.patch("/isolate", async (req, res) => {
  const { id } = req.body;
  const URL = `https://api-${authProp.dataRegion}.central.sophos.com/endpoint/v1/endpoints/${id}/isolation`;
  const reqBody = {
    enabled: true,
    comment: "Isolate - Log360 Cloud",
  };
  patchRequest(URL, res, reqBody);
});

router.get("/applications", async (req, res) => {
  const URL = `https://api-${authProp.dataRegion}.central.sophos.com/endpoint/v1/settings/exploit-mitigation/applications?pageTotal=true`;
  getRequest(URL, res);
});

router.post("/scan", async (req, res) => {
  const { endpointID } = req.body;
  const URL = `https://api-${authProp.dataRegion}.central.sophos.com/endpoint/v1/endpoints/${endpointID}/scans`;
  postRequest(URL, res);
});

router.get("/:endpointID", async function (req, res) {
  const endpointID = req.params.endpointID;
  if (!endpointID) {
    res.status(400).send("Invalid Request");
  }

  console.log(endpointID, " endpoint ID ");
  const URL = `https://api-${authProp.dataRegion}.central.sophos.com/endpoint/v1/endpoints/${endpointID}`;
  getRequest(URL, res);
});

router.delete("/", async function (req, res) {
  const { id } = req.query;
  const URL = `https://api-${authProp.dataRegion}.central.sophos.com/endpoint/v1/endpoints/${id}`;

  deleteRequest(URL, res);
});

router.post("/adaptive-attack-protection", async (req, res) => {
  const { endpointID } = req.body;
  if (!endpointID) {
    res.status(400).send("endpoint ID is empty");
  }
  const URl = `https://api-${authProp.dataRegion}.central.sophos.com/endpoint/v1/endpoints/${endpointID}/adaptive-attack-protection`;
  const reqBody = {
    enabled: true,
    expiresAfter: "P7D", //Duration (in ISO 8601 format)
  };

  postRequest(URl, res, reqBody);
});

module.exports = router;
