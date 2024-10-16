const spiderWebChart = {
  chart: {
    polar: true,
    type: "area",
  },

  title: {
    text: null,
  },

  pane: {
    size: "80%",
  },

  xAxis: {
    categories: [],
    tickmarkPlacement: "on",
    lineWidth: 0,
    min: 0, // Set the minimum value of the y-axis
  },

  yAxis: {
    gridLineInterpolation: "polygon",
    lineWidth: 0,
    min: 0,
  },

  tooltip: {
    shared: true,
    pointFormat:
      '<span style="color:{series.color}">{series.name}: <b>' +
      "{point.y}</b><br/>",
  },

  legend: {
    enabled: false,
  },

  series: [
    {
      name: "MITRE Attack",
      data: [],
      color: "#7300e6",
    },
  ],

  responsive: {
    rules: [
      {
        condition: {
          maxWidth: 500,
        },
        chartOptions: {
          pane: {
            size: "70%",
          },
        },
      },
    ],
  },
};

async function setData() {
  await fetch("/detections").then(async (res) => {
    if (res.ok) {
      const data = await res.json();
      const detections = data.items; // todo : pagination
      const tactics = {};
      let maximum = 10;
      const categories = [];
      const seriesData = [];
      if (detections && detections.length) {
        detections.map((detection) => {
          const attacks = detection.mitreAttacks;
          if (attacks) {
            attacks.map((attack) => {
              const name = attack.tactic.name;
              if (name) {
                if (tactics[name]) {
                  tactics[name]++;
                  maximum = Math.max(tactics[name], maximum);
                } else {
                  tactics[name] = 1;
                }
              }
            });
          }
        });

        Object.entries(tactics).map((entry) => {
          const name = entry[0];
          const count = entry[1];
          categories.push(name);
          seriesData.push(count);
        });

        spiderWebChart.xAxis.categories = categories;
        spiderWebChart.series[0].data = seriesData;
        Highcharts.chart("container", spiderWebChart);
      }
    }
  });
}

setData();
