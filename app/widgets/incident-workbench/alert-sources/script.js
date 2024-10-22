const pieChart = {
  chart: {
    type: "pie",
  },
  title: {
    text: null,
  },

  plotOptions: {
    series: {
      borderRadius: 5,
      dataLabels: [
        {
          enabled: true,
          distance: 15,
          format: "{point.name}",
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
      '<span style="color:{point.color}">{point.source}</span>: ' +
      "<b>{point.y:.2f}%</b> of total<br/>",
  },

  series: [
    {
      name: "Sources",
      colorByPoint: true,
      data: [],
    },
  ],
};

async function setData() {
  await fetch("/alerts").then(async (res) => {
    if (res.ok) {
      const data = await res.json();
      const alerts = data.items; // todo : pagination
      const sources = {};
      const seriesData = [];
      if (alerts && alerts.length) {
        alerts.map((alert) => {
          const source = alert.source;
          if (source) {
            if (sources[source]) {
              sources[source]++;
            } else {
              sources[source] = 1;
            }
          }
        });

        Object.entries(sources).map((entry) => {
          const source = entry[0];
          const y = entry[1];
          seriesData.push({ source, y });
        });

        pieChart.series[0].data = seriesData;
        Highcharts.chart("container", pieChart);
      }
    }
  });
}

setData();
