// Create the chart
const pieChart = {
  chart: {
    type: "pie",
  },
  title: {
    text: "Top Alerts",
    align: "left",
  },
  // subtitle: {
  //     text: 'Click the slices to view versions. Source: <a href="http://statcounter.com" target="_blank">statcounter.com</a>',
  //     align: 'left'
  // },

  accessibility: {
    // announceNewData: {
    //     enabled: true
    // },
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
            fontSize: "0.9em",
            textOutline: "none",
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
      data: [],
    },
  ],
  exporting: {
    enabled: false,
  },
};

async function setData(params) {
  console.log("fetching data...");
  const data = await fetch("/alerts").then(async (res) => await res.json());
  console.log("data ", data);
  const items = data.items;
  const alertsCount = {};

  items.map((alert) => {
    if (alertsCount[alert.description]) {
      alertsCount[alert.description]++;
    } else {
      alertsCount[alert.description] = 1;
    }
  });

  const seriesData = [];

  Object.entries(alertsCount).forEach((entry) => {
    seriesData.push({
      name: entry[0],
      label:
        entry[0].length > 10 ? entry[0].slice(0, 10) + "..." : entry[0],
      y: entry[1],
    });
  });

  pieChart.series[0].data = seriesData;
  console.log("chart loading...");
  Highcharts.chart("top-alerts", pieChart);
}

document.addEventListener("DOMContentLoaded", async () => {
  // Highcharts.chart("top-alerts", pieChart);
  console.log("data loading...");
  setData();
});