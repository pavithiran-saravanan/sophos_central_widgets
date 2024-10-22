let total = 12;
const donutChart = {
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
            .label(`Total<br/><strong>${total}</strong>`)
            .css({
              color: "#000",
              textAnchor: "middle",
            })
            .add();
        }

        const x = series.center[0] + chart.plotLeft,
          y =
            series.center[1] +
            chart.plotTop -
            customLabel.attr("height") / 2;

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
        ["Cleanable", 5],
        ["Non-Cleanable", 7],
      ],
    },
  ],
  exporting: {
    enabled: false,
  },
};

async function setData(params) {
  console.log("fetching data...");

  // Fetch Alerts Data
  const data = await fetch("/alerts").then(
    async (res) => await res.json()
  );
  console.log("data ", data);
  const items = data.items;

  let cleanable = 0;
  let nonCleanable = 0;
  items.map((alertItem) => {
    if(alertItem.threat != null){
      if(alertItem.threat_cleanable){
        cleanable = cleanable + 1;
      }
      else nonCleanable = nonCleanable + 1;
    }
  });
  total = cleanable + nonCleanable;

  // Set chart Data
  donutChart.series[0].data[0][1] = cleanable;
  donutChart.series[0].data[1][1] = nonCleanable;

  console.log("chart loading...");
  Highcharts.chart("endpointsHealth", donutChart);
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("data loading...");
  setData();
});