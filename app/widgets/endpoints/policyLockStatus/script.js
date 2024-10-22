async function setData() {
  try {
    const response = await fetch("/health-check");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const policy = data.endpoint.policy;
    const computerPolicyLocked = policy.computer["threat-protection"].policies
      .map((policy) => policy.lockedByManagingAccount)
      .reduce((accumulator, value) => (accumulator + value ? 1 : 0), 0);
    const computerPolicyUnlocked =
      policy.computer["threat-protection"].policies.length -
      computerPolicyLocked;
    const serverPolicyLocked = policy.server[
      "server-threat-protection"
    ].policies
      .map((policy) => policy.lockedByManagingAccount)
      .reduce((accumulator, value) => (accumulator + value ? 1 : 0), 0);
    const serverPolicyUnlocked =
      policy.server["server-threat-protection"].policies.length -
      serverPolicyLocked;

    Highcharts.chart("policyLockStatus", {
      chart: {
        type: "column",
      },
      title: { text: undefined },
      xAxis: {
        categories: ["Computer", "Server"],
      },
      yAxis: {
        min: 0,
        title: {
          text: "Count",
        },
        allowDecimals: false,
      },
      colors: ["#307DBC", "#51B6FD"],
      plotOptions: {
        series: {
          allowPointSelect: true,
          cursor: "pointer",
          borderRadius: 0,
          dataLabels: [{ enabled: false }, { enabled: false }],
          point: {
            events: {
              click: (event) => {
                console.log("Clicked point:", event);
                return false;
              },
            },
          },
          showInLegend: true,
        },
      },
      series: [
        {
          name: "Locked",
          data: [computerPolicyLocked, serverPolicyLocked],
        },
        {
          name: "Unlocked",
          data: [computerPolicyUnlocked, serverPolicyUnlocked],
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching policy lock status data:", error);
    document.getElementById("policyLockStatus").innerHTML =
      "<p>Error loading policy lock status data. Please try again later.</p>";
  }
}

document.addEventListener("DOMContentLoaded", setData);
