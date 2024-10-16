const data = {};

const mappings = {
  id: "Sophos Endpoint ID",
  type: "Endpoint Type",
  hostname: "Host Name",
  "health.overall": "Health Status",
  "health.threats.status": "Threat Status",
  "os.platform": "OS Platform",
  "os.name": "OS Name",
  "os.majorversion": "OS Version",
  ipv4Addresses: "IPv4 Address",
  ipv6Addresses: "IPv6 Address",
  macAddresses: "Mac Address",
  "associatedPerson.name": "Associated Person",
  tamperProtectionEnabled: "Thamper Protection",
  lastSeenAt: "Last Seen At",
  "cloud.provider": "Cloud provider",
  "cloud.instanceId": "Cloud Instance ID",
};

function getValueFromData(obj, path) {
  return path
    .split(".")
    .reduce(
      (acc, key) => acc && (Array.isArray(acc[key]) ? acc[key][0] : acc[key]),
      obj
    );
}

async function setData(endpointId) {
  await fetch(`/endpoints/${endpointId}`).then(async (res) => {
    if (res.ok) {
      let tData = "";
      const data = await res.json();
      Object.entries(mappings).forEach((entry) => {
        const value = getValueFromData(data, entry[0]);

        if (value) {
          tData += `<tr><td>${entry[1]}</td><td>${value}</td></tr>`;
        }
      });
      const table = document.getElementById("endpoint-details-widget-table");
      table.innerHTML = tData;

      console.log(tData);
    }
  });
}

setData("87acc049-f420-4827-aa86-4f2e367a2486");
