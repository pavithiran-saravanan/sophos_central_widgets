var express = require("express");
const { authProp, Authenticate } = require("./Auth");
var router = express.Router();

router.get("/", function (req, res) {
  try {
    const data = getEndpoints();
    console.log("data ", data);
    res.send(data);
  } catch (err) {
    res.json({ error: "something not correct" });
  }
});

router.get("/:endpointID", async function (req, res) {
  try {
    const id = req.params.endpointID;
    const data = await getEndpointDetails(id);
    console.log("data ", data);
    res.send(data);
  } catch (err) {
    console.log(err);
    res.json({ error: "something not correct" });
  }
});

async function getEndpoints() {
  const res = await fetch(
    `https://api-${authProp.dataRegion}.central.sophos.com/endpoint/v1/endpoints`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authProp.access_token}`,
        "X-Tenant-ID": authProp.tenantID,
      },
    }
  ).then(async (response) => {
    const data = await response.json();
    console.log("response Data : ", data);
    if (response.status === 401) {
      await Authenticate();
      console.log("access _key", authProp.access_token);
    }
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    return data;
  });
  return res;
}

async function getEndpointDetails(endpointID) {
  const res = await fetch(
    `https://api-${authProp.dataRegion}.central.sophos.com/endpoint/v1/endpoints/${endpointID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authProp.access_token}`,
        "X-Tenant-ID": authProp.tenantID,
      },
    }
  ).then(async (response) => {
    const data = await response.json();
    console.log("response Data : ", data);
    if (response.status === 401) {
      await Authenticate();
      console.log("new access_token", authProp.access_token);
    }
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return data;
  });
  return res;
}

module.exports = router;
