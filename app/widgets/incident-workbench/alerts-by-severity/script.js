const pieChart = {
  chart: {
    plotBackgroundColor: null,
    plotBorderWidth: null,
    plotShadow: false,
    type: "pie",
  },
  title: {
    text: null,
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
      data: [],
    },
  ],
};

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
          const severity = alert.severity;
          if (severity === "high") {
            high++;
          } else if (severity === "medium") {
            medium++;
          } else {
            low++;
          }
        });

        pieChart.series[0].data = [
          { name: "High", y: high },
          { name: "Medium", y: medium },
          { name: "Low", y: low },
        ];
        Highcharts.chart("container", pieChart);
      }
    }
  });
}

setData();
