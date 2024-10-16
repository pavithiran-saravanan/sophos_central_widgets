async function scanEndpoint() {
  const endpointID = "6f56511d-f3f9-4c39-9b7b-113cc6a638fd";

  await fetch("/scans", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpointID: endpointID,
    }),
  }).then(async (res) => {
    const data = await res.json();
    console.log(data);
    if (res.ok && data.response === "success") {
      const status = document.getElementById("scanStatus");
      status.innerText = "Scan Triggered Successfully";
    }
  });
}

async function updateAAP() {
  const endpointID = "6f56511d-f3f9-4c39-9b7b-113cc6a638fd";

  await fetch("/adaptive-attack-protection", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpointID: endpointID,
    }),
  }).then(async (res) => {
    const data = await res.json();
    console.log(data);

    if (res.ok && data.response === "success") {
      const status = document.getElementById("protectionStatus");
      status.innerText = "Adaptive Attack Protection Enabled Successfully";
    }
  });
}
