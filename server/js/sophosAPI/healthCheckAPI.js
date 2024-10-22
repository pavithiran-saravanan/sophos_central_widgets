var express = require("express");
const { authProp, Authenticate } = require("./Auth");
var router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await getHealthCheckResponse();
    //console.log("data ", data);
    res.send(data);
  } catch (err) {
    console.log(err);
    res.json({ error: "something not correct" });
  }
});

async function getHealthCheckResponse() {
  const res = await fetch(
    `https://api-${authProp.dataRegion}.central.sophos.com/account-health-check/v1/health-check`,
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
      throw new Error("Network response was not ok " + response.statusText);
    }
    return data;
  });
  return res;
}

module.exports = router;
