const { authProp, Authenticate } = require("../sophosAPI/auth");

async function getRequest(URL, res, reqBody) {
  try {
    const data = await fetch(URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authProp.access_token}`,
        "X-Tenant-ID": authProp.tenantID,
      },
      //   body: reqBody ? JSON.stringify(reqBody) : JSON.stringify({}),
    }).then(async (res) => {
      const data = await res.json();
      //console.log("response data", data);
      if (res.status === 401) {
        await Authenticate();
        console.log("new access_token", authProp.access_token);
        return getRequest(URL, reqBody);
      }
      if (!res.ok) {
        console.log(res);
        throw new Error("Network response was not ok " + res.statusText);
      }
      return data;
    });
    if (!res) return data;
    res.status(200).send(data);
  } catch (err) {
    console.log(err);
    console.log(URL);
    if (res) res.status(500).send(data);
  }
}

async function postRequest(URL, res, reqBody) {
  try {
    const data = await fetch(URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authProp.access_token}`,
        "X-Tenant-ID": authProp.tenantID,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: reqBody ? JSON.stringify(reqBody) : JSON.stringify({}),
    }).then(async (res) => {
      const data = await res.json();
      //console.log("response data", data);
      if (res.status === 401) {
        await Authenticate();
        console.log("new access_token", authProp.access_token);
        return postRequest(URL, reqBody);
      }
      if (!res.ok) {
        throw new Error("Network response was not ok " + res.statusText);
      }
      data.response = "success";
      return data;
    });
    if (!res) return data;
    res.status(200).send(data);
  } catch (err) {
    console.log(err);
    if (res) res.status(500).send(data);
  }
}

async function deleteRequest(URL, res, reqBody) {
  try {
    const res = await fetch(URL, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authProp.access_token}`,
        "X-Tenant-ID": authProp.tenantID,
        Accept: "application/json",
      },
    }).then(async (res) => {
      const data = await res.json();
      //console.log("response data", data);
      if (res.status === 401) {
        await Authenticate();
        console.log("new access_token", authProp.access_token);
        return postRequest(URL, reqBody);
      }
      if (!res.ok) {
        throw new Error("Network response was not ok " + res.statusText);
      }
      data.response = "success";
      return data;
    });
    if (!res) return data;
    res.status(200).send(data);
  } catch (err) {
    console.log(err);
    if (res) res.status(500).send(data);
  }
}

async function patchRequest(URL, res, body) {
  try {
    const res = await fetch(URL, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${authProp.access_token}`,
        "X-Tenant-ID": authProp.tenantID,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: reqBody ? JSON.stringify(reqBody) : JSON.stringify({}),
    }).then(async (res) => {
      const data = await res.json();
      // console.log("response data", data);
      if (res.status === 401) {
        await Authenticate();
        console.log("new access_token", authProp.access_token);
        isolateEndpoint(endpointID);
      }
      if (!res.ok) {
        throw new Error("Network response was not ok " + res.statusText);
      }
      data.response = "success";
      return data;
    });
    if (!res) return data;
    res.status(200).send(data);
  } catch (err) {
    console.log(err);
    if (res) res.status(500).send(data);
  }
  return res;
}

module.exports = {
  getRequest,
  postRequest,
  deleteRequest,
  patchRequest,
};
