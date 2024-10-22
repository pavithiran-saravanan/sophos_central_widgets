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
            .label(`Total<br/><strong>${10}</strong>`)
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
      data: [58, 13],
    },
  ],
};

async function setData() {
  await fetch("/events").then(async (res) => {
    if (res.ok) {
      let cleanable = 0,
        faliedCleanup = 0;
      const data = await res.json();
      const events = data.items; // todo : pagination

      if (events && events.length) {
        events.map((event) => {
          const type = event.type;
          if (type.includes("Clean")) {
            if (type.includes("Failed")) {
              faliedCleanup++;
            } else {
              cleanable++;
            }
          }
        });
      }
      donutChart.series[0].data = [cleanable, faliedCleanup];
      Highcharts.chart("container", donutChart);
    }
  });
}

setData();
