async function setData() {
  try {
    const response = await fetch("/endpoints");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const counts = data.items.reduce((acc, item) => {
      const key =
        item.isolation.status === "isolated" ? "Isolated" : "Non Isolated";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    Highcharts.chart("endpointsStatusChart", {
      chart: {
        type: "pie",
        custom: {},
        events: {
          render() {
            const chart = this,
              series = chart.series[0];
            let customLabel = chart.options.chart.custom.label;
            const total = series.yData.reduce((sum, value) => sum + value, 0);

            if (!customLabel) {
              customLabel = chart.options.chart.custom.label = chart.renderer
                .label(
                  `<strong>${total}</strong></br><small style="font-size: 0.8em; color: #888;">Total</small>`
                )
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
      title: { text: "Endpoint Status", align: "left" },
      legend: {
        align: "right",
        verticalAlign: "middle",
        layout: "vertical",
      },
      plotOptions: {
        series: {
          allowPointSelect: true,
          cursor: "pointer",
          borderRadius: 0,
          dataLabels: [{ enabled: false }, { enabled: false }],
          point: {
            events: {
              click: (event) => {
                console.log("Clicked point:", event.point.name);
                return false;
              },
            },
          },
          showInLegend: true,
        },
      },
      series: [
        {
          name: "Endpoint Status",
          colorByPoint: true,
          innerSize: "60%",
          colors: ["#E57E4D", "#E54C4C"],
          data: Object.entries(counts).map(([name, y]) => ({ name, y })),
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching endpoint data:", error);
    document.getElementById("endpointsStatusChart").innerHTML =
      "<p>Error loading endpoint status data. Please try again later.</p>";
  }
}

document.addEventListener("DOMContentLoaded", setData);
