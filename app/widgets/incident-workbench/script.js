//data fetching
const alertsData = getData("/alerts");
const eventsData = getData("/events");
const endpointsData = getData("/endpoints");
const usersData = getData("/common/users");
const scoresData = getData("/health-check");
const detectionsData = getData("/detections/results");

//load widgets
loadSummary("85172fa2-d839-4d24-afac-2274a3c22a7e");
loadThreats();
loadDetectionMITRE();
loadAlertBySeverity();
loadAlertSources();
loadThreatLocation();

var alertEvents = null;

async function loadSummary(endpointID) {
  await fetch(`/endpoints/${endpointID}`).then(async (res) => {
    let tData = "<table>";
    const data = await res.json();
    Object.entries(mappings).forEach((entry) => {
      const value = getValueFromObject(data, entry[0]);
      if (value) {
        if (entry[0] === "lockdown.status") {
          document.getElementById("isolationStatus").innerHTML = `<p>${
            value === "isolated" ? "Isolated" : "Not Isolated"
          }</p>`;
          tData += `<tr><td>${entry[1]}</td><td>${
            value === "isolated" ? "Isolated" : "Not Isolated"
          }</td></tr>`;
        } else {
          tData += `<tr><td>${entry[1]}</td><td>${value}</td></tr>`;
        }
      }
    });
    tData += "</table>";
    const summaryDetails = document.getElementById("summaryDetailsTable");
    summaryDetails.innerHTML = tData;
  });
}

async function loadThreats() {
  await eventsData.then(({ items: events }) => {
    let cleanable = 0,
      faliedCleanup = 0;

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
    } else {
      document.getElementById("threats").innerHTML = "<p>No Data</p>";
      return;
    }
    const total = cleanable + faliedCleanup;
    const seriesData = [
      { name: "Cleanable", y: cleanable },
      { name: "Non-Cleanable", y: faliedCleanup },
    ];
    Highcharts.chart("threats", {
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
                .label(`Total<br/><p style="color:#ccc">${total}</p>`)
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
        text: "Cleanable vs Non-Cleanable Threats",
        align: "left",
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
          name: "Count",
          type: "pie",
          colorByPoint: true,
          innerSize: "75%",
          data: seriesData,
        },
      ],
    });
  });
}

async function loadDetectionMITRE() {
  const mitreAttacksCategories = {
    impact: 0,
    reconnaissance: 0,
    "resource development": 0,
    "initial access": 0,
    execution: 0,
    presistence: 0,
    "privilege esclation": 0,
    "defence evation": 0,
    "credential access": 0,
    discovery: 0,
    "lateral movement": 0,
    collection: 0,
    "command and control": 0,
    exfiltration: 0,
  };
  await detectionsData.then(({ items: detections }) => {
    const categories = [];
    const seriesData = [];
    if (detections && detections.length) {
      detections.map((detection) => {
        const attacks = detection.mitreAttacks;
        if (attacks) {
          attacks.map((attack) => {
            const name = attack.tactic.name;
            if (name) {
              mitreAttacksCategories[name.toLowerCase()]++;
            }
          });
        }
      });

      Object.entries(mitreAttacksCategories).map((entry) => {
        const name = entry[0];
        const count = entry[1];
        categories.push(name);
        seriesData.push(count);
      });

      Highcharts.chart("detectionMITRE", {
        chart: {
          polar: true,
          type: "area",
        },

        title: {
          text: "Detection MITRE ATT&CK Coverage",
          align: "left",
        },

        pane: {
          size: "80%",
        },

        xAxis: {
          categories,
          tickmarkPlacement: "on",
          lineWidth: 0,
          min: 0,
        },

        yAxis: {
          gridLineInterpolation: "polygon",
          lineWidth: 0,
          min: 0,
        },

        tooltip: {
          shared: true,
          pointFormat:
            '<span style="color:{series.color}">{series.name}: <b>' + "{point.y}</b><br/>",
        },

        legend: {
          enabled: false,
        },

        series: [
          {
            name: "Count",
            data: seriesData,
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
      });
    } else {
      document.getElementById("detectionMITRE").innerHTML = "<p>No Data</p>";
      return;
    }
  });
}

async function loadAlertSources() {
  const sources = {};
  const seriesData = [];
  const { items: alerts } = await alertsData;
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
      seriesData.push({ name: source, y });
    });

    Highcharts.chart("alertSources", {
      chart: {
        type: "pie",
      },
      title: {
        text: "Alerts Sources",
        align: "left",
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
          '<span style="color:{point.color}">{point.name}</span>: ' +
          "<b>{point.y}</b> of total<br/>",
      },

      series: [
        {
          name: "Sources",
          colorByPoint: true,
          data: seriesData,
        },
      ],
    });
  } else {
    document.getElementById("alertSources").innerHTML = "<p>No Data</p>";
    return;
  }
}

async function loadAlertBySeverity() {
  const { items: alerts } = await alertsData;
  if (alerts && alerts.length) {
    let high = 0,
      medium = 0,
      low = 0;
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

    const seriesData = [
      { name: "High", y: high },
      { name: "Medium", y: medium },
      { name: "Low", y: low },
    ];
    Highcharts.chart("alertsBySeverity", {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: "pie",
      },
      title: {
        text: "Alerts By Severity",
        align: "left",
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
          name: "Count",
          data: seriesData,
          point: {
            events: {
              click: function (event) {
                loadAlertsBySeverityTable(alerts, this.name.toLowerCase());
                switchDrillDown(true);
              },
            },
          },
        },
      ],
    });
  } else {
    document.getElementById("alertsBySeverity").innerHTML = "<p>No Data</p>";
    return;
  }
}

async function loadThreatLocation() {
  const { items: alerts } = await alertsData;
  if (alerts && alerts.length) {
    const threatLocation = {};
    const seriesData = [];
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
      seriesData.push({ name: path, y });
    });

    Highcharts.chart("alertThreatLocation", {
      chart: {
        type: "column",
      },
      title: {
        text: "Alerts Threat Location",
        align: "left",
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
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: ' + "<b>{point.y}</b>",
      },

      series: [
        {
          name: "Location",
          color: "#ff9933",
          data: seriesData,
        },
      ],
    });
  } else {
    document.getElementById("alertThreatLocation").innerHTML = "<p>No Data</p>";
    return;
  }
}

function loadAlertsBySeverityTable(alerts, currSeverity) {
  let tableData = "<table><tr><th>Alerts</th><th>Alert Created At</th></tr>";
  alerts.map((alert) => {
    const { when, name, type, description, threat, severity } = alert;
    if (currSeverity === severity) {
      const title = threat ? threat : name ? name : type.substring(type.lastIndexOf(":"));
      const timePart = new Date(when).toISOString().split("T")[1].split(".")[0];
      const row = `<tr>
                <td><div class="alert-content">
                  <div class="heading">Alert : ${title}</div>
                  <div class="description">${description}</div>
                </div></td>
                <td>${timePart}</td>
                </tr>`;
      tableData += row;
    }
  });
  tableData += "</table>";

  document.getElementById("alertSeverityTable").innerHTML = tableData;
}

async function scanEndpoint() {
  const endpointID = "6f56511d-f3f9-4c39-9b7b-113cc6a638fd";

  await fetch("/scans", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpointID: endpointID,
    }),
  }).then(async (res) => {
    const data = await res.json();
    console.log(data);
    if (res.ok && data.response === "success") {
      const status = document.getElementById("scanStatus");
      status.innerText = "Scan Triggered Successfully";
    }
  });
}

async function updateAAP() {
  const endpointID = "6f56511d-f3f9-4c39-9b7b-113cc6a638fd";

  await fetch("endpoints/adaptive-attack-protection", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpointID: endpointID,
    }),
  }).then(async (res) => {
    const data = await res.json();
    console.log(data);

    if (res.ok && data.response === "success") {
      const status = document.getElementById("protectionStatus");
      status.innerText = "Adaptive Attack Protection Enabled Successfully";
    }
  });
}

//util functions
async function getData(url) {
  return fetch(url)
    .then((response) => response.json())
    .catch((error) => {
      throw error;
    });
}
function generateTable(tableData) {
  let table = "<table>";
  table +=
    '<tr><th class="tableTitle alignLeft">Actors</th><th class="tableTitle alignRight">Frequency</th></tr>';
  tableData.forEach((item) => {
    const name = item.name.length > 150 ? item.name.substring(0, 150) : item.name;
    table += `<tr class=\"tableRow\"><td class=\"tableData alignLeft\">${name}</td><td class=\"tableData alignRight\">${item.value}</td></tr>`;
  });
  table += "</table>";
  return table;
}

function getPath(str) {
  const regex = /'([^']+)'/g;

  const isPath = (text) => text.includes("/") || text.includes("\\");

  const paths = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    if (isPath(match[1])) {
      return match[1];
    }
  }
}

$(document).ready(function () {
  initDatePicker();
  bindListeners();

  $(function () {
    setDatePickerLabel($("#date-range").data("fwdaterangepicker"));
  });
});

function datePickerCallback(startDate, endDate) {}

function initDatePicker() {
  const params = {
    startDate: moment(),
    endDate: moment(),
    linkedCalendars: false,
    showChips: true,
    basePickerClass: "fwdatepicker",
    buttonClasses: "btn",
    opens: "left",
    autoUpdateInput: false,
    minDate: moment("1970-01-01").startOf("day"),
    maxDate: moment("2030-12-31").endOf("day"),
    locale: {
      format: "YYYY-MM-DD HH:mm:ss",
      applyLabel: "Apply",
      cancelLabel: "Cancel",
      fromLabel: "From",
      toLabel: "To",
      daysOfWeek: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
      monthNames: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "July",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    ranges: {
      Today: [moment(), moment()],
      Yesterday: [moment().subtract(1, "days"), moment().subtract(1, "days")],
      "Last 7 Days": [moment().subtract(6, "days"), moment()],
      "Last 30 Days": [moment().subtract(29, "days"), moment()],
      "This Month": [moment().startOf("month"), moment().endOf("month")],
      "Last Month": [
        moment().subtract(1, "month").startOf("month"),
        moment().subtract(1, "month").endOf("month"),
      ],
    },
    template: `<div class="fw fwdatepicker without-arrow with-drp-btns">
                  <div class="ranges">
                      <div class="range_inputs range_selections"><span>Last</span><input type="number" class="last_input" maxlength="5">
                          <div class="selectbox"><select class="select-min noBSSelect"><option value="d" selected>Days</option><option value="w">Weeks</option><option value="M">Months</option></select></div>
                      </div>
                  </div>
                  <div class="calendar left">
                      <div class="daterangepicker_input"><span class="date-label">From</span><input class="input-mini" type="text" name="daterangepicker_start" value="" /><i class="daterangepicker-icon date-calendar"></i></div>
                      <div class="calendar-table"></div>
                  </div>
                  <div class="calendar right">
                      <div class="daterangepicker_input"><span class="date-label">To</span><input class="input-mini" type="text" name="daterangepicker_end" value="" /><i class="daterangepicker-icon date-calendar"></i></div>
                      <div class="calendar-table"></div>
                  </div>
                  <div class="drp-buttons"><button class="applyBtn" disabled="disabled" type="button"></button> <button class="cancelBtn" type="button"></button></div>
              </div>`,
    parentEl: "#home",
  };

  $("#date-range").fwdaterangepicker(params, datePickerCallback);
}

function setDatePickerLabel(datePicker) {
  datePicker.calculateChosenLabel();
  datePicker.hideCalendars();

  function isCustomLabel(label) {
    return label === "Custom Range";
  }

  if (!isCustomLabel(datePicker.chosenLabel)) {
    $("#date-range").val(datePicker.chosenLabel);
  } else {
    $("#date-range").val(
      datePicker.startDate.format(datePicker.locale.format) +
        " - " +
        datePicker.endDate.format(datePicker.locale.format)
    );
  }
}

function bindListeners() {
  $(".range_inputs.range_selections").on("input", function () {
    let fwDatePicker = $("input#date-range")
      .data("fwdaterangepicker")
      .container.closest(".fwdatepicker");
    var filterFormat = fwDatePicker.find(".range_selections .select-min").find(":selected").val();
    var filterValue = fwDatePicker.find(".range_selections .last_input").val();
    if (filterValue && filterValue > 0 && filterFormat) {
      var calendar = $("input#date-range").data("fwdaterangepicker");
      calendar.setStartDate(
        moment(new Date().toLocaleString(moment.locale()))
          .subtract(filterValue - 1, filterFormat)
          .startOf(filterFormat)
      );
      calendar.setEndDate(moment(new Date().toLocaleString(moment.locale())).endOf(filterFormat));
      calendar.updateView();
    }
  });

  $("input#date-range").on("apply.fwdatepicker", function (event, picker) {
    setDatePickerLabel(picker);
  });

  $("#date-range")
    .siblings(".input-group-btn")
    .on("click", function () {
      $("input#date-range").click();
    });
}

const mappings = {
  id: "Sophos Endpoint ID",
  type: "Endpoint Type",
  hostname: "Host Name",
  "health.overall": "Health Status",
  "health.threats.status": "Threat Status",
  "os.platform": "OS Platform",
  "os.name": "OS Name",
  "os.majorversion": "OS Version",
  ipv4Addresses: "IPv4 Address",
  ipv6Addresses: "IPv6 Address",
  macAddresses: "Mac Address",
  "associatedPerson.name": "Associated Person",
  tamperProtectionEnabled: "Thamper Protection",
  lastSeenAt: "Last Seen At",
  "lockdown.status": "Isolation Status",
  "cloud.provider": "Cloud provider",
  "cloud.instanceId": "Cloud Instance ID",
};
const widgets = [
  "summaryDetails",
  "alertsBySeverity",
  "threats",
  "detectionMITRE",
  "alertSources",
  "alertThreatLocation",
];
function switchDrillDown(open) {
  widgets.map((widget) => {
    document.getElementById(widget).style.display = open ? "none" : "block";
  });

  document.getElementById("alertsBySeverityTableContainer").style.display = !open
    ? "none"
    : "block";
}

function getValueFromObject(obj, path) {
  return path
    .split(".")
    .reduce((acc, key) => acc && (Array.isArray(acc[key]) ? acc[key][0] : acc[key]), obj);
}
