async function isolateEndpoint(deviceId) {
    // Get isolation details for the endpoint
    await fetch(`/getIsolation/${deviceId}`).then(async (res) => {
        const data = await res.json();
        console.log("Get Isolation: ", data);
        if (res.ok && data.response === "success") {
            if(data.enabled){
                displayBanner("Endpoint Already Isolated", "error");
            }
            else{
                await fetch(`/isolateEndpoint/${deviceId}`).then(async (response) => {
                    const isolateData = await response.json();
                    console.log("Isolate Endpoint: ", isolateData);
                    if (response.ok && isolateData.response === "success") {
                      displayBanner("Endpoint Isolated Successfully");
                    }
                });
            }
        }
    });
}
  
async function deleteEndpoint(deviceId) {
    await fetch(`/deleteEndpoint/${deviceId}`).then(async (res) => {
      const data = await res.json();
      console.log("Delete Endpoint", data);
      if (res.ok && data.response === "success") {
        displayBanner("Deleted Successfully");
      }
    });
}
  
async function scanEndpoint(deviceId) {
    await fetch(`/scanEndpoint/${deviceId}`).then(async (res) => {
      const data = await res.json();
      console.log("Scan Endpoint: ", data);
      if (res.ok && data.response === "success") {
        displayBanner("Scan Triggered Successfully");
      }
    });
}
  
async function updateAAP(deviceId) {
    await fetch(`/updateAAP/${deviceId}`).then(async (res) => {
      const data = await res.json();
      console.log("Update AAP: ", data);
      if (res.ok && data.response === "success") {
        displayBanner("Adaptive Attack Protection Enabled Successfully");
      }
    });
}