var chart;

const alertEvents = [];
let alertsBySeverityData = [];

const alertsBySeverity = setData().then(() =>
  Highcharts.chart("container", {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: "pie",
    },
    title: {
      text: "Alerts By Severity",
    },
    tooltip: {
      pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
    },
    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },
    legend: {
      align: "right",
      verticalAlign: "middle",
    },
    plotOptions: {
      pie: {
        colors: ["#66d9ff", "#0096cc", "#004b66"],
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: false,
        },
        showInLegend: true,
      },
    },
    series: [
      {
        name: "Severity",
        data: alertsBySeverityData,
        point: {
          events: {
            click: function (event) {
              //console.log(event);
              switchDrillDown(true);
            },
          },
        },
      },
    ],
  })
);

function switchDrillDown(openOrClose) {
  const status = openOrClose ? "none" : "block";
  document.getElementById("container").style.display = status;
  document.getElementById("container1").style.display = status;
  document.getElementById("container2").style.display = status;

  if (openOrClose) {
    loadTable();
  }
  document.getElementById("alertSeverity").style.display = !openOrClose
    ? "none"
    : "block";
}

function loadTable() {
  let tableData = "<tr><th>Alerts</th><th>Alert Created At</th></tr>";
  alertEvents.map((alert) => {
    const { when, name, description } = alert;
    const row = `<tr><td>${description}</td><td>${when}</td></tr>`;
    tableData += row;
  });
  document.getElementById("alertSeverityTable").innerHTML = tableData;
}

async function setData() {
  await fetch("/alerts").then(async (res) => {
    if (res.ok) {
      let high = 0,
        medium = 0,
        low = 0;
      const data = await res.json();
      const alerts = data.items; // todo : pagination

      if (alerts && alerts.length) {
        alerts.map((alert) => {
          alertEvents.push(alert);
          const severity = alert.severity;
          if (severity === "high") {
            high++;
          } else if (severity === "medium") {
            medium++;
          } else {
            low++;
          }
        });

        alertsBySeverityData = [
          { name: "High", y: high },
          { name: "Medium", y: medium },
          { name: "Low", y: low },
        ];
        console.log(alertsBySeverityData);
      }
    }
  });
}
