const columnChart = {
  chart: {
    type: "column",
  },
  title: {
    text: null,
  },
  xAxis: {
    type: "category",
  },
  yAxis: {
    title: {
      text: null,
    },
  },
  legend: {
    enabled: false,
  },
  plotOptions: {
    series: {
      borderWidth: 0,
      dataLabels: {
        enabled: true,
        format: "{point.y:.1f}%",
      },
    },
  },

  tooltip: {
    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
    pointFormat:
      '<span style="color:{point.color}">{point.path}</span>: ' +
      "<b>{point.y:.2f}%</b>",
  },

  series: [
    {
      name: "Location",
      color: "#ff9933",
      data: [
        {
          path: "Chrome",
          y: 63.06,
        },
        {
          path: "Safari",
          y: 19.84,
        },
        {
          path: "Firefox",
          y: 4.18,
        },
        {
          path: "Edge",
          y: 4.12,
        },
        {
          path: "Opera",
          y: 2.33,
        },
        {
          path: "Internet Explorer hjghgghgftfyfuhghj fhuvhjuhgyug vgvhvuhguy vhvhyu",
          y: 0.45,
        },
        {
          path: "Other",
          y: 1.582,
        },
      ],
    },
  ],
};

function getPath(str) {
  const regex = /'([^']+)'/g;

  const isPath = (text) => text.includes("/") || text.includes("\\");

  let match;
  while ((match = regex.exec(str)) !== null) {
    if (isPath(match[1])) {
      return match[1];
    }
  }
}

async function setData() {
  await fetch("/alerts").then(async (res) => {
    if (res.ok) {
      const data = await res.json();
      const alerts = data.items; // todo : pagination
      const threatLocation = {};
      const seriesData = [];
      if (alerts && alerts.length) {
        alerts.map((alert) => {
          const description = alert.description;
          const path = getPath(description);
          if (path) {
            if (threatLocation[path]) {
              threatLocation[path]++;
            } else {
              threatLocation[path] = 1;
            }
          }
        });

        Object.entries(threatLocation).map((entry) => {
          const path = entry[0];
          const y = entry[1];
          seriesData.push({ path, y });
        });

        columnChart.series[0].data = seriesData;
        Highcharts.chart("container", columnChart);
      }
    }
  });
}

setData();
