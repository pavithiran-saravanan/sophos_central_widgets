var express = require("express");
const { authProp, Authenticate } = require("./Auth");
var router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { endpointID } = req.body;
    console.log(req.body, endpointID);
    const data = await updateAAP(endpointID);
    console.log("data ", data);
    res.send(data);
  } catch (err) {
    console.log(err);
    res.json({ error: "something not correct" });
  }
});

async function updateAAP(endpointID) {
  const res = await fetch(
    `https://api-${authProp.dataRegion}.central.sophos.com/endpoint/v1/endpoints/${endpointID}/adaptive-attack-protection`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authProp.access_token}`,
        "X-Tenant-ID": authProp.tenantID,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        enabled: true,
        expiresAfter: "P7D", //Duration (in ISO 8601 format) after which the endpoint will leave Adaptive Attack Protection.
      }),
    }
  ).then(async (res) => {
    const data = await res.json();
    console.log("response data", data);
    if (res.status === 401) {
      await Authenticate();
      console.log("new access_token", authProp.access_token);
    }
    if (!res.ok) {
      throw new Error("Network response was not ok " + res.statusText);
    }
    data.response = "success";
    return data;
  });

  return res;
}

module.exports = router;
