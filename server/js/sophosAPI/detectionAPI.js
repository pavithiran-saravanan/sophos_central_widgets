var express = require("express");
const { authProp, Authenticate } = require("./Auth");
var router = express.Router();
var runID = null;

router.get("/", async (req, res) => {
  try {
    const data = await getDetections();

    //console.log("data ", data);
    res.send(data);
  } catch (err) {
    console.log(err);
    res.json({ error: "something not correct" });
  }
});

async function getDetections() {
  if (!runID) {
    await setRunID();
  }
  const res = await fetch(
    `https://api-${authProp.dataRegion}.central.sophos.com/detections/v1/queries/detections/${runID}/results?pageSize=500`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authProp.access_token}`,
        "X-Tenant-ID": authProp.tenantID,
      },
    }
  ).then(async (res) => {
    const data = await res.json();
    // console.log("response data", data);
    if (res.status === 401) {
      await Authenticate();
      console.log("new access_token", authProp.access_token);
    }
    if (!res.ok) {
      throw new Error("Network response was not ok " + res.statusText);
    }
    return data;
  });
  return res;
}

async function setRunID() {
  await fetch(
    `https://api-${authProp.dataRegion}.central.sophos.com/detections/v1/queries/detections`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authProp.access_token}`,
        "X-Tenant-ID": authProp.tenantID,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  ).then(async (res) => {
    const data = await res.json();
    // console.log("response data ", data);

    if (res.status === 401) {
      await Authenticate();
      console.log("new access_token", authProp.access_token);
    }
    if (!res.ok) {
      throw new Error("Network response was not ok " + res.statusText);
    }

    if (data.id) {
      runID = data.id;
    } else {
      throw new Error("RunID not found " + res.statusText);
    }
  });
}
module.exports = router;
