//data fetching
const alertsData = getData("/alerts");
const eventsData = getData("/events");
const endpointsData = getData("/endpoints");
const usersData = getData("/common/users");
const scoresData = getData("/health-check");

//loading data
summaryWidget();
cleanableVsNonCleanableThreats();
scoreWidget();
threatActorsWidget();
threatsOverTimeWidget();
topAlerts();
async function summaryWidget() {
  const { items: alerts } = await alertsData;
  const alertCount = document.getElementById("alertCount");
  alertCount.innerText = alerts.length;

  const { items: endpoints } = await endpointsData;
  let suspicious = endpoints.reduce(
    (count, endpoint) => (endpoint.health.overall !== "good" ? count++ : count),
    0
  );
  const infectedEndpointsCount = document.getElementById("infectedEndpointsCount");
  infectedEndpointsCount.innerText = suspicious;

  const { items: events } = await eventsData;
  let threatActors = 0;
  let PolicyViolationBlocked = 0;
  events.map((event) => {
    const { type, description } = event;
    if (getPath(description)) {
      threatActors++;
    }
    if ((type && type.includes("::BLOCKED")) || type.includes("::Blocked")) {
      PolicyViolationBlocked++;
    }
  });
  const threatActorsCount = document.getElementById("threatActorsCount");
  threatActorsCount.innerText = threatActors;
  const policyViolationBlockedCount = document.getElementById("policyViolationBlocked");
  policyViolationBlockedCount.innerText = PolicyViolationBlocked;

  const { items: users } = await usersData;
  const usersCount = document.getElementById("usersCount");
  usersCount.innerText = users.length;
}

async function cleanableVsNonCleanableThreats() {
  const { items: alerts } = await alertsData;
  let cleanable = 0;
  let nonCleanable = 0;
  alerts.map((alert) => {
    if (alert.threat != null) {
      if (alert.threat_cleanable) cleanable++;
      else nonCleanable++;
    }
  });
  if (!nonCleanable && !cleanable) {
    document.getElementById("endpointsHealth").innerHTML = "<p>No Data</p>";
    return;
  }
  Highcharts.chart("endpointsHealth", {
    chart: {
      type: "pie",
      custom: {},
      events: {
        render() {
          const chart = this,
            series = chart.series[0];
          let customLabel = chart.options.chart.custom.label;

          if (!customLabel) {
            customLabel = chart.options.chart.custom.label = chart.renderer
              .label(`Total<br/><strong>${cleanable + nonCleanable}</strong>`)
              .css({
                color: "#000",
                textAnchor: "middle",
              })
              .add();
          }

          const x = series.center[0] + chart.plotLeft,
            y = series.center[1] + chart.plotTop - customLabel.attr("height") / 2;

          customLabel.attr({
            x,
            y,
          });
          // Set font size based on chart diameter
          customLabel.css({
            fontSize: `${series.center[2] / 12}px`,
          });
        },
      },
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    legend: {
      align: "right",
      verticalAlign: "middle",
    },
    plotOptions: {
      series: {
        borderWidth: 0,
        colorByPoint: true,
        type: "pie",
        size: "100%",
        innerSize: "80%",
        dataLabels: {
          enabled: false,
        },
        showInLegend: true,
      },
    },
    colors: ["#80BB4F", "#DD3F3E"],
    series: [
      {
        name: "Endpoints",
        type: "pie",
        colorByPoint: true,
        innerSize: "75%",
        data: [
          ["Cleanable", cleanable],
          ["Non-Cleanable", nonCleanable],
        ],
      },
    ],
    exporting: {
      enabled: false,
    },
  });
}

async function scoreWidget() {
  const data = await scoresData;
  const computerScore = [];
  const serverScore = [];
  const globalScore = [0, 0];
  const endpoint = data.endpoint;

  computerScore.push(endpoint.protection.computer.score);
  computerScore.push(endpoint.policy.computer["threat-protection"].score);
  computerScore.push(endpoint.exclusions.policy.computer.score);
  computerScore.push(endpoint.tamperProtection.computer.score);

  serverScore.push(endpoint.protection.server.score);
  serverScore.push(endpoint.policy.server["server-threat-protection"].score);
  serverScore.push(endpoint.exclusions.policy.server.score);
  serverScore.push(endpoint.tamperProtection.server.score);

  globalScore.push(endpoint.exclusions.global.score);
  globalScore.push(endpoint.tamperProtection.globalDetail.score);

  Highcharts.chart("scoreChart", {
    chart: {
      type: "column",
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: ["protection", "policy threat protection", "exclusions", "tamperProtection"],
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
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
    series: [
      {
        name: "Computer",
        data: computerScore,
      },
      {
        name: "Server",
        data: serverScore,
      },
      {
        name: "Global",
        data: globalScore,
      },
    ],
    colors: ["#80b3ff", "#000066", "#29293d"],
    exporting: {
      enabled: false,
    },
  });
}

async function threatActorsWidget() {
  const { items: events } = await eventsData;
  const threatActorsCount = {};

  events.map((event) => {
    const path = getPath(event.name);
    if (path) threatActorsCount[path] = threatActorsCount[path] ? threatActorsCount[path] + 1 : 1;
  });
  const tableData = [];

  Object.entries(threatActorsCount).forEach((entry) => {
    tableData.push({ name: entry[0], value: entry[1] });
  });

  if (!tableData.length) {
    document.getElementById("threat-table-container").innerHTML = "<p>No Data</p>";
    return;
  }

  const tableContainer = document.getElementById("threat-table-container");
  tableContainer.innerHTML = generateTable(tableData);
}

async function threatsOverTimeWidget() {
  const { items: events } = await eventsData;

  // Parse data
  let hourlyCounter = {};
  events.forEach((event) => {
    if (event.threat) {
      const bucketName = getHourBucket(event.when);
      if (!hourlyCounter[bucketName]) hourlyCounter[bucketName] = 1;
      else hourlyCounter[bucketName]++;
    }
  });
  const hourlyChartData = Object.entries(hourlyCounter).map(([key, value]) => [Number(key), value]);

  if (!hourlyChartData.length) {
    document.getElementById("threatsOverTime").innerHTML = "<p>No Data</p>";
    return;
  }

  // Render chart
  Highcharts.chart("threatsOverTime", {
    chart: {
      type: "line",
    },

    title: {
      text: "",
      align: "left",
    },

    exporting: {
      enabled: false,
    },

    credits: {
      enabled: false,
    },

    tooltip: {
      formatter: function () {
        return "Time: " + new Date(this.x).toUTCString() + "<br>" + "Threats: " + this.y;
      },
    },

    subtitle: {
      text: "",
      align: "left",
    },

    yAxis: {
      title: {
        text: "Count",
      },
    },

    xAxis: {
      title: {
        text: "Time",
      },
      type: "datetime", // Set the x-axis to handle time
      tickInterval: 3600000,
      max: new Date().getTime(), // Set the max to current time
    },

    legend: {
      enabled: false,
    },

    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
      },
    },

    series: [
      {
        color: "#FF0000",
        data: hourlyChartData,
      },
    ],

    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              layout: "horizontal",
              align: "center",
              verticalAlign: "bottom",
            },
          },
        },
      ],
    },
  });
}

async function topAlerts() {
  const { items: alerts } = await alertsData;
  const alertsCount = {};

  alerts.map(({ description }) => {
    alertsCount[description] = alertsCount[description] ? alertsCount[description]++ : 1;
  });

  const seriesData = [];

  Object.entries(alertsCount).forEach((entry) => {
    seriesData.push({
      name: entry[0],
      label: entry[0].length > 150 ? entry[0].slice(0, 10) + "..." : entry[0],
      y: (entry[1] / items.length) * 100,
    });
  });

  if (!seriesData.length) {
    document.getElementById("top-alerts").innerHTML = "<p>No Data</p>";
    return;
  }

  Highcharts.chart("top-alerts", {
    chart: {
      type: "pie",
    },
    title: {
      text: "",
      align: "left",
    },
    credits: {
      enabled: false,
    },
    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },

    plotOptions: {
      series: {
        borderRadius: 5,
        dataLabels: [
          {
            enabled: true,
            distance: 15,
            format: "{point.label}",
          },
          {
            enabled: true,
            distance: "-30%",
            filter: {
              property: "percentage",
              operator: ">",
              value: 5,
            },
            format: "{point.y:.1f}%",
            style: {
              // fontSize: "0.9em",
              textOutline: "none",
              color: "white",
            },
          },
        ],
      },
    },

    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      pointFormat:
        '<span style="color:{point.color}">{point.name}</span>: ' +
        "<b>{point.y:.2f}%</b> of total<br/>",
    },

    series: [
      {
        name: "Alerts",
        colorByPoint: true,
        data: seriesData,
      },
    ],
    exporting: {
      enabled: false,
    },
  });
}

//util functions
async function getData(url) {
  return fetch(url)
    .then((response) => response.json())
    .catch((error) => {
      throw error;
    });
}
function generateTable(tableData) {
  let table = "<table>";
  table +=
    '<tr><th class="tableTitle alignLeft">Actors</th><th class="tableTitle alignRight">Frequency</th></tr>';
  tableData.forEach((item) => {
    const name = item.name.length > 150 ? item.name.substring(0, 150) : item.name;
    table += `<tr class=\"tableRow\"><td class=\"tableData alignLeft\">${name}</td><td class=\"tableData alignRight\">${item.value}</td></tr>`;
  });
  table += "</table>";
  return table;
}

function getPath(str) {
  const regex = /'([^']+)'/g;

  const isPath = (text) => text.includes("/") || text.includes("\\");

  const paths = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    if (isPath(match[1])) {
      return match[1];
    }
  }
}

function getHourBucket(isoString) {
  // return new Date(isoString).getTime();
  const [datePart, timePart] = isoString.split("T");
  const [year, month, day] = datePart.split("-");
  const [hour, minute, second] = timePart.split(":"); // Get the hour & minute. Ignore seconds
  return Date.UTC(year, month - 1, day, hour, minute);
}
