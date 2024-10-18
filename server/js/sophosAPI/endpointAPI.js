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

router.delete("/", async function (req, res) {
  try {
    const { id } = req.query;
    const data = await deleteEndpoint(id);
    console.log("data ", data);
    res.send(data);
  } catch (err) {
    console.log(err);
    res.json({ error: "something not correct" });
  }
});

router.get("/isolate", async (req, res) => {
  try {
    const { id } = req.query;
    const data = await getEndpointIsolation(id);
    console.log("data ", data);
    res.send(data);
  } catch (err) {
    console.log(err);
    res.json({ error: "something not correct" });
  }
});

router.patch("/isolate", async (req, res) => {
  try {
    const { id } = req.body;
    const data = await isolateEndpoint(id);
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

async function deleteEndpoint(endpointID) {
  const res = await fetch(
    `https://api-${authProp.dataRegion}.central.sophos.com/endpoint/v1/endpoints/${endpointID}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authProp.access_token}`,
        "X-Tenant-ID": authProp.tenantID,
        Accept: "application/json",
      }
    }
  ).then(async (res) => {
    const data = await res.json();
    console.log("response data", data);
    if (res.status === 401) {
      await Authenticate();
      console.log("new access_token", authProp.access_token);
      deleteEndpoint(endpointID)
    }
    if (!res.ok) {
      throw new Error("Network response was not ok " + res.statusText);
    }
    data.response = "success";
    return data;
  });
  return res;
}

async function getEndpointIsolation(endpointID) {
  const res = await fetch(
    `https://api-${authProp.dataRegion}.central.sophos.com/endpoint/v1/endpoints/${endpointID}/isolation`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authProp.access_token}`,
        "X-Tenant-ID": authProp.tenantID,
        Accept: "application/json"
      }
    }
  ).then(async (res) => {
    const data = await res.json();
    console.log("response data", data);
    if (res.status === 401) {
      await Authenticate();
      console.log("new access_token", authProp.access_token);
      getEndpointIsolation(endpointID)
    }
    if (!res.ok) {
      throw new Error("Network response was not ok " + res.statusText);
    }
    data.response = "success";
    return data;
  });
  return res;
}

async function isolateEndpoint(endpointID) {
  const res = await fetch(
    `https://api-${authProp.dataRegion}.central.sophos.com/endpoint/v1/endpoints/${endpointID}/isolation`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${authProp.access_token}`,
        "X-Tenant-ID": authProp.tenantID,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "enabled": true,
        "comment": "Isolate - Log360 Cloud"
      }),
    }
  ).then(async (res) => {
    const data = await res.json();
    console.log("response data", data);
    if (res.status === 401) {
      await Authenticate();
      console.log("new access_token", authProp.access_token);
      isolateEndpoint(endpointID)
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
