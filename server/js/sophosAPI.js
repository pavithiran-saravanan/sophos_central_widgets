let dotenv = require('dotenv').config()

const dataRegion = dotenv.parsed.DATA_REGION;
let access_token = null;
let refresh_token = dotenv.parsed.REFRESH_TOKEN;
const clientId = dotenv.parsed.CLIENT_ID;
const clietSecret = dotenv.parsed.CLIENT_SECRET;
const tenantID = dotenv.parsed.TENANT_ID;

async function runHealthCheckQuery() {
  if (!access_token) {
    Authenticate();
  }
  if (!tenantID) {
    whoAmI();
  }
  try {
    const res = await fetch(
      `https://api-${dataRegion}.central.sophos.com/account-health-check/v1/health-check`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "X-Tenant-ID": tenantID,
        },
      }
    ).then(async (response) => {
      const data = await response.json();
      console.log("response Data : ", data);
      if (response.status === 401) {
        Authenticate();
        runHealthCheckQuery();
      }
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return data;
    });
    return res;
  } catch (err) {
    console.log("error");
    console.error(err);
    return "Error";
  }
}

async function getEndpoints() {
  if (!access_token) {
    Authenticate();
  }
  if (!tenantID) {
    whoAmI();
  }
  try {
    const res = await fetch(
      `https://api-${dataRegion}.central.sophos.com/endpoint/v1/endpoints`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "X-Tenant-ID": tenantID,
        },
      }
    ).then(async (response) => {
      const data = await response.json();
      console.log("response Data : ", data);
      if (response.status === 401) {
        console.log("access _key", access_token);
        Authenticate();
        getEndpoints();
      }

      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      console.log(access_token);
      return data;
    });
    return res;
  } catch (err) {
    console.log("error");
    console.error(err);
    return "Error";
  }
}

async function getAlerts() {
  if (!access_token) {
    Authenticate();
  }
  if (!tenantID) {
    whoAmI();
  }
  try {
    const res = await fetch(
      `https://api-${dataRegion}.central.sophos.com/siem/v1/alerts`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "X-Tenant-ID": tenantID,
        },
      }
    ).then(async (response) => {
      const data = await response.json();
      console.log("response Data : ", data);
      if (response.status === 401) {
        Authenticate();
      }
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return data;
    });
    return res;
  } catch (err) {
    console.log("error");
    console.error(err);
    return "Error";
  }
}

async function getEvents() {
  if (!access_token) {
    Authenticate();
  }
  if (!tenantID) {
    whoAmI();
  }
  try {
    const res = await fetch(
      `https://api-${dataRegion}.central.sophos.com/siem/v1/events`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "X-Tenant-ID": tenantID,
        },
      }
    ).then(async (response) => {
      const data = await response.json();
      console.log("response Data : ", data);
      if (response.status === 401) {
        Authenticate();
      }
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return data;
    });
    return res;
  } catch (err) {
    console.log("error");
    console.error(err);
    return "Error";
  }
}

async function runDetectionsQuery() {
  if (!access_token) {
    Authenticate();
  }
  if (!tenantID) {
    whoAmI();
  }
  try {
    const res = await fetch(`https://api-${dataRegion}.central.sophos.com/detections/v1/queries/detections`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${access_token}`,
          'X-Tenant-ID': tenantID,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    }).then(async (response) => {
      const data = await response.json();
      console.log("response Data : ", data);
      if (response.status === 401) {
        Authenticate();
      }
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return data;
    });
    return res;
  } catch (err) {
    console.log("error");
    console.error(err);
    return "Error";
  }
}

async function getDetections() {
  if (!access_token) {
    Authenticate();
  }
  if (!tenantID) {
    whoAmI();
  }
  return runDetectionsQuery().then((response)=>{
    const detectionsId = response.id;
    try {
      return fetch(`https://api-${dataRegion}.central.sophos.com/detections/v1/queries/detections/${detectionsId}/results?page=1&pageSize=1000`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'X-Tenant-ID': tenantID
        }
    }).then(async (response) => {
        const data = await response.json();
        console.log("response Data : ", data);
        if (response.status === 401) {
          Authenticate();
        }
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return data;
      });
    } catch (err) {
      console.log("error");
      console.error(err);
      return "Error";
    }
  })
}

async function getUsers() {
  if (!access_token) {
    Authenticate();
  }
  if (!tenantID) {
    whoAmI();
  }
  try {
    const res = await fetch(
      `https://api-${dataRegion}.central.sophos.com/common/v1/directory/users`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "X-Tenant-ID": tenantID,
        },
      }
    ).then(async (response) => {
      const data = await response.json();
      console.log("response Data : ", data);
      if (response.status === 401) {
        Authenticate();
      }
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return data;
    });
    return res;
  } catch (err) {
    console.log("error");
    console.error(err);
    return "Error";
  }
}

async function getApplications() {
  if (!access_token) {
    Authenticate();
  }
  if (!tenantID) {
    whoAmI();
  }
  try {
    const res = await fetch(
      `https://api-${dataRegion}.central.sophos.com/endpoint/v1/settings/exploit-mitigation/applications?pageTotal=true`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "X-Tenant-ID": tenantID,
        },
      }
    ).then(async (response) => {
      const data = await response.json();
      console.log("response Data : ", data);
      if (response.status === 401) {
        Authenticate();
      }
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return data;
    });
    return res;
  } catch (err) {
    console.log("error");
    console.error(err);
    return "Error";
  }
}
async function Authenticate() {
  try {
    await fetch("https://id.sophos.com/api/v2/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "token",
        client_id: clientId,
        client_secret: clietSecret,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }).then(async (res) => {
      const data = await res.json();
      console.log("Auth response", data);
      if (!res.ok) {
        throw new Error("Authentication Error", res);
      }
      // const data = await res.json();
      console.log("Auth response", data);
      access_token = data.access_token;
      refresh_token = data.refresh_token;
    });
  } catch (err) {
    console.log("auth error", err);
    throw err;
  }
}

async function RefreshToken() {
  await fetch("https://id.sophos.com/api/v2/oauth2/token", {
    method: "POST",
    body: {
      grant_type: "client_credentials",
      refresh_token: refresh_token,
      client_id: clientId,
      client_secret: clietSecret,
    },
  }).then(async (res) => {
    if (!res.ok) {
      throw new Error("Authentication Error", res);
    }
    const data = await res.json();
    console.log("Auth response", data);
    access_token = data.access_token;
    refresh_token = data.refresh_token;
  });
}

async function whoAmI(params) {
  await fetch("https://api.central.sophos.com/whoami/v1").then(async (res) => {
    const data = await res.json();
    tenantID = data.id;
    console.log("tenet : ", await res.json());
  });
}

module.exports = {
  runHealthCheckQuery,
  getEndpoints,
  getAlerts,
  getUsers,
  getEvents,
  getDetections,
  getApplications,
};
