var express = require("express");
const { getRequest, postRequest } = require("../helper/request");
const { authProp, Authenticate } = require("./auth");
var router = express.Router();
var runID = null;

router.get("/status", async (req, res) => {
  if (!runID) {
    await setRunID();
  }
  const URL = `https://api-${authProp.dataRegion}.central.sophos.com/detections/v1/queries/detections/${runID}`;
  getRequest(URL, res);
});

router.get("/results", async (req, res) => {
  if (!runID) {
    await setRunID();
  }
  const URL = `https://api-${authProp.dataRegion}.central.sophos.com/detections/v1/queries/detections/${runID}/results?pageSize=500`;
  getRequest(URL, res);
});

async function setRunID() {
  const URL = `https://api-${authProp.dataRegion}.central.sophos.com/detections/v1/queries/detections`;
  const data = await postRequest(URL);
  runID = data.id;
}
module.exports = router;
