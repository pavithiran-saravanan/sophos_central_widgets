const clientId = process.env.CLIENT_ID;
const clietSecret = process.env.CLIENT_SECRET;
const authProp = {
  access_token:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjFIaXNtSjFSZmIwRWJqYjJ6dy01LVhTNlFiYXBaZWtOcVpsVU51TVdac2cifQ.eyJqdGkiOiJJRC5kOGMxNDEzNC00MWNlLTQ0OTMtODExYS03YTdhYzJhNGExNWEiLCJjbGllbnRfaWQiOiJhNTIwYjBjMC1jODVlLTQxMzctOGY4Yy03MmJhNGI3MjdmMWYiLCJleHAiOjE3Mjk2NzA4MjEsImlhdCI6MTcyOTY2NzIyMSwicnRfaGFzaCI6IjRQR2dvQkdqS0R3eDdIQ2dyYmpQaVE9PSIsImF1dGhfdGltZSI6MTcyOTY2NzIyMSwiaXNzIjoiaHR0cHM6Ly9pZC5zb3Bob3MuY29tIiwidmVyIjoxLCJnaWQiOiIwZGQzMzE5MS1lNDEzLTQ2Y2QtYWZjZS03ZTJiMDQ2ODNlYjIiLCJhdWQiOiJhcGk6Ly9jZW50cmFsLXByb3Zpc2lvbmluZyIsImFwcF9pbmZvIjp7ImFjY291bnRUeXBlIjoiY3VzdG9tZXIifX0.mYF0IlcX9r_bY6_YPUqSoQ_IshtjfaQfmQ-VNxpL6H4dN0JXASPjujIQ81bBWKfLTXaIIJ3y7EiEXRerFH5oN6EblW-XwJaHnNMRQ732IADry9PM4OYwVdv3QXuGxpPNCrD3O6R6i9NcrhlJMF5ImXCOf4G2P-d5IfVgf0fxHtHgrMrMoV6pO1FKPwmzB78TkCd_z2T6jt7SxJeUYDjleLm6mcWBIKR365j0E6K0S0tml5hxcK5cLvw3QHEheD2Xrbw9wNcbLqf-HnaZ3twbFROIbMyjTFSpf0HTXBtyoPN1eEQmh7iV1YPnq4b2DavJeXinytKMZma2U-cu6H1WsimCOQZfUlxcxbR4skIaUMpqMdMnnSwmBRLA_YFmNBgqnKWla_5oS_FODn7iF6wWctgBz0DsAWScJ6rUmhNecklR6KlsT6itxcs3ZJvYPEasVpYXzAF8wJyQpGxskzuRBi2anPouvyPBpLzNvG-qGn4EKB_PNSx_J__k3jRclXQxiA5byPWrbovRq0QOjjEhI4WY0LpcPhTW3AwAm233LeU1L5UgmWV80ulI-6jo_AwCdQVXmuBkxu-HRTzkyaVXvzDs8N06v4vgqIy7HgBqobUizw6_0OBhF941Ml_-z4dsRkOWqp6DgVDRWhbwylnAj4HO79hf5kSO7eqGbh3KcNk",
  refresh_token: null,
  tenantID: "0dd33191-e413-46cd-afce-7e2b04683eb2",
  dataRegion: process.env.DATA_REGION,
};

const authPromise = fetch("https://id.sophos.com/api/v2/oauth2/token", {
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
})
  .then(async (res) => {
    const data = await res.json();
    console.log("Auth response", data);
    if (!res.ok) {
      throw new Error("Authentication Error", res);
    }
    authProp.access_token = data.access_token;
    authProp.refresh_token = data.refresh_token;
  })
  .catch((err) => {
    console.log("auth error", err);
  });

async function Authenticate() {
  return await authPromise;
}

module.exports = {
  authProp,
  Authenticate,
};
