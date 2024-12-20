async function setData() {
  try {
    const response = await fetch("/health-check");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const protection = data.endpoint.protection;

    Highcharts.chart("snoozedFeatures", {
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
      title: { text: "Snoozed Features", align: "left" },
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
          name: "Snoozed Features",
          colorByPoint: true,
          innerSize: "60%",
          colors: ["#2F7DBC", "#3EBCBD"],
          data: [
            {
              name: "Computer",
              y: protection.computer.snoozed ? protection.computer.total : 0,
            },
            {
              name: "Server",
              y: protection.server.snoozed ? protection.server.total : 0,
            },
          ],
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching snoozed features data:", error);
    document.getElementById("snoozedFeatures").innerHTML =
      "<p>Error loading snoozed features data. Please try again later.</p>";
  }
}

document.addEventListener("DOMContentLoaded", setData);
