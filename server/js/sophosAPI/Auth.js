const clientId = process.env.CLIENT_ID;
const clietSecret = process.env.CLIENT_SECRET;
const authProp = {
  access_token: null,
  refresh_token: null,
  tenantID: "0dd33191-e413-46cd-afce-7e2b04683eb2",
  dataRegion: process.env.DATA_REGION,
};
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
      authProp.access_token = data.access_token;
      authProp.refresh_token = data.refresh_token;
    });
  } catch (err) {
    console.log("auth error", err);
    throw err;
  }
}

module.exports = {
  authProp,
  Authenticate,
};
