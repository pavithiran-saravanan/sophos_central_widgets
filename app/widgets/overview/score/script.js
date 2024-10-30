const columnChart = {
  chart: {
    type: "column",
    // height: '100%'
  },
  title: {
    text: "",
  },
  credits: {
    enabled: false,
  },
  xAxis: {
    categories: [
      "protection",
      "policy threat protection",
      "exclusions",
      "tamperProtection",
    ],
    crosshair: true,
    accessibility: {
      description: "Countries",
    },
  },
  yAxis: {
    min: 0,
    title: {
      text: "Score",
    },
  },
  //   tooltip: {
  //     valueSuffix: " (1000 MT)",
  //   },
  plotOptions: {
    column: {
      pointPadding: 0.2,
      borderWidth: 0,
    },
  },
  series: [
    {
      name: "Computer",
      data: [0, 0, 0, 0],
    },
    {
      name: "Server",
      data: [0, 0, 0, 0],
    },
    {
      name: "Global",
      data: [0, 0, 0, 0],
    },
  ],
  colors: ["#80b3ff", "#000066", "#29293d"],
  exporting: {
    enabled: false,
  },
};

async function setData(params) {
  console.log("fetching data...");
  const data = await fetch("/scores").then(async (res) => await res.json());
  console.log("data ", data);
  const computerScore = [];
  const serverScore = [];
  const globalScore = [0, 0];
  const endpoint = data.endpoint;
  console.log("endpoint ", endpoint);
  computerScore.push(endpoint.protection.computer.score);
  computerScore.push(endpoint.policy.computer["threat-protection"].score);
  computerScore.push(endpoint.exclusions.policy.computer.score);
  computerScore.push(endpoint.tamperProtection.computer.score);
  serverScore.push(endpoint.protection.server.score);
  serverScore.push(
    endpoint.policy.server["server-threat-protection"].score
  );
  serverScore.push(endpoint.exclusions.policy.server.score);
  serverScore.push(endpoint.tamperProtection.server.score);
  globalScore.push(endpoint.exclusions.global.score);
  globalScore.push(endpoint.tamperProtection.globalDetail.score);
  columnChart.series[0].data = computerScore;
  columnChart.series[1].data = serverScore;
  columnChart.series[2].data = globalScore;
  console.log("chart loading...");
  Highcharts.chart("scoreChart", columnChart);
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("data loading...");
  setData();
});