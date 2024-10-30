async function isolateEndpoint(deviceId) {
    // Get isolation details for the endpoint
    await fetch(`/getIsolation/${deviceId}`).then(async (res) => {
        const data = await res.json();
        console.log("Get Isolation: ", data);
        if (res.ok) {
            if(data.response === "success"){
                if(data.enabled){
                    displayBanner("Endpoint Already Isolated", "error");
                }
                else{
                    await fetch(`/isolateEndpoint/${deviceId}`).then(async (response) => {
                        const isolateData = await response.json();
                        console.log("Isolate Endpoint: ", isolateData);
                        if (res.ok) {
                            if(data.response === "success"){
                                displayBanner("Endpoint Isolated Successfully");
                            }
                            else if(data.error){
                                displayBanner(data.message, "error");
                            }
                            else{
                                displayBanner("Error", "error");
                            }
                        }
                        else{
                            displayBanner("Error", "error");
                        }
                    });
                }
            }
            else if(data.error){
                displayBanner(data.message, "error")
            }
            else{
                displayBanner("Error", "error");
            }
        }
        else{
            displayBanner("Error", "error");
        }
    });
}
  
async function deleteEndpoint(deviceId) {
    await fetch(`/deleteEndpoint/${deviceId}`).then(async (res) => {
      const data = await res.json();
      console.log("Delete Endpoint", data);
      if (res.ok) {
        if(data.response === "success"){
            displayBanner("Deleted Successfully");
        }
        else if(data.error){
            displayBanner(data.message, "error");
        }
        else{
            displayBanner("Error", "error");
        }
      }
      else{
        displayBanner("Error", "error");
      }
    });
}
  
async function scanEndpoint(deviceId) {
    await fetch(`/scanEndpoint/${deviceId}`).then(async (res) => {
      const data = await res.json();
      console.log("Scan Endpoint: ", data);
      if (res.ok) {
        if(data.response === "success"){
            displayBanner("Scan Triggered Successfully");
        }
        else if(data.error){
            displayBanner(data.message, "error");
        }
        else{
            displayBanner("Error", "error");
        }
      }
      else{
        displayBanner("Error", "error");
      }
    });
}
  
async function updateAAP(deviceId) {
    await fetch(`/updateAAP/${deviceId}`).then(async (res) => {
      const data = await res.json();
      console.log("Update AAP: ", data);
      if (res.ok) {
        if(data.response === "success"){
            displayBanner("Adaptive Attack Protection Enabled Successfully");
        }
        else if(data.error){
            displayBanner(data.message, "error");
        }
        else{
            displayBanner("Error", "error");
        }
      }
      else{
        displayBanner("Error", "error");
      }
    });
}