document.addEventListener("DOMContentLoaded", loadData);

$( document ).ready(function() {
    initDatePicker()
    bindListeners()

    $(function() {
        setDatePickerLabel($('#date-range').data("fwdaterangepicker"))
    })
})

function datePickerCallback(startDate, endDate) {
    
}

function initDatePicker(){
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
            daysOfWeek: [
                "Su",
                "Mo",
                "Tu",
                "We",
                "Th",
                "Fr",
                "Sa"
            ],
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
                "Dec"
            ]
        },
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
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
    }

    $('#date-range').fwdaterangepicker(params, datePickerCallback);
}

function setDatePickerLabel(datePicker){
    datePicker.calculateChosenLabel();
    datePicker.hideCalendars();

    function isCustomLabel(label){
        return label === "Custom Range";
    }

    if (!isCustomLabel(datePicker.chosenLabel)) {
        $('#date-range').val(datePicker.chosenLabel);
    } else {
        $('#date-range').val(datePicker.startDate.format(datePicker.locale.format) + " - " + datePicker.endDate.format(datePicker.locale.format));
    }
}

function bindListeners(){

    $(".range_inputs.range_selections").on("input", function() {
        let fwDatePicker = $('input#date-range').data("fwdaterangepicker").container.closest(".fwdatepicker");
        var filterFormat = fwDatePicker.find(".range_selections .select-min").find(":selected").val();
        var filterValue = fwDatePicker.find(".range_selections .last_input").val();
        if (filterValue && filterValue > 0 && filterFormat) {
            var calendar = $('input#date-range').data("fwdaterangepicker");
            calendar.setStartDate(moment(new Date().toLocaleString(moment.locale())).subtract(filterValue - 1, filterFormat).startOf(filterFormat));
            calendar.setEndDate(moment(new Date().toLocaleString(moment.locale())).endOf(filterFormat));
            calendar.updateView();
        }
    })

    $('input#date-range').on("apply.fwdatepicker", function(event, picker){
        setDatePickerLabel(picker)
    })

    $('#date-range').siblings('.input-group-btn').on("click", function () {
        $('input#date-range').click();
    })
}

function loadData() {
    let endpointsAPI = fetch("/endpoints");
    let healthCheckAPI = fetch("/health-check");

    Promise.all([endpointsAPI, healthCheckAPI])
    .then(values => Promise.all(values.map(value => value.json())))
    .then(jsonValues => {
      let endpointsAPIResp = jsonValues[0];
      let healthCheckAPIResp = jsonValues[1];

      Highcharts.setOptions({lang: {noData: "No data available"}});

      renderEndpointStatus(endpointsAPIResp);
      renderEndpointsByHealth(endpointsAPIResp);

      rederEndpointProtectionStatus(healthCheckAPIResp)
      renderPolicyLockStatus(healthCheckAPIResp);
      renderPolicyNotRecommended(healthCheckAPIResp);
      renderSnoozeFeatures(healthCheckAPIResp);
      renderTamperProtectionStatus(healthCheckAPIResp);
    });
}

function renderEndpointStatus(data) {
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
}

function renderEndpointsByHealth(data) {
    const counts = data.items.reduce((acc, item) => {
    const key =
        item.health.overall === "suspicious"
        ? "Suspicious"
        : item.health.overall == "good"
        ? "Good"
        : "Bad";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
    }, {});

    Highcharts.chart("endpointsByHealth", {
    chart: {
        type: "pie",
        custom: {},
        events: {
        render() {
            const chart = this,
            series = chart.series[0];
            let customLabel = chart.options.chart.custom.label;
            const total = series.yData.reduce((sum, value) => {
            if (isNaN(value)) return sum;
            return sum + value;
            }, 0);

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
    title: { text: "Endpoints by Health", align: "left" },
    legend: {
        align: "right",
        verticalAlign: "middle",
        layout: "vertical",
        itemMarginBottom: 5,
        itemMarginTop: 5,
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
        name: "Endpoint Health",
        colorByPoint: true,
        innerSize: "60%",
        colors: ["#84BA53", "#F8B944", "#D44743"],
        data: [
            { name: "Good", y: counts.Good },
            { name: "Suspicious", y: counts.Suspicious },
            { name: "Bad", y: counts.Bad },
        ],
        },
    ],
    });
}

async function rederEndpointProtectionStatus(data) {
    const protection = data.endpoint.protection;

    Highcharts.chart("endpointsProtectionStatus", {
    chart: {
        type: "column",
    },
    title: { text: "Endpoint Protection Status", align: "left" },
    xAxis: {
        categories: ["Computer", "Server"],
    },
    yAxis: {
        min: 0,
        title: {
        text: "Count",
        },
        allowDecimals: false,
    },
    colors: ["#7FBC4F", "#DD3F3E"],
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
        name: "Fully Protected",
        data: [
            protection.computer.total - protection.computer.notFullyProtected,
            protection.server.total - protection.server.notFullyProtected,
        ],
        },
        {
        name: "Not Fully Protected",
        data: [
            protection.computer.notFullyProtected,
            protection.server.notFullyProtected,
        ],
        },
    ],
    });
}

function renderPolicyLockStatus(data) {
    const policy = data.endpoint.policy;
    const computerPolicyLocked = policy.computer["threat-protection"].policies
        .map((policy) => policy.lockedByManagingAccount)
        .reduce((accumulator, value) => (accumulator + value ? 1 : 0), 0);
    const computerPolicyUnlocked =
        policy.computer["threat-protection"].policies.length -
        computerPolicyLocked;
    const serverPolicyLocked = policy.server[
        "server-threat-protection"
    ].policies
        .map((policy) => policy.lockedByManagingAccount)
        .reduce((accumulator, value) => (accumulator + value ? 1 : 0), 0);
    const serverPolicyUnlocked =
        policy.server["server-threat-protection"].policies.length -
        serverPolicyLocked;

    Highcharts.chart("policyLockStatus", {
        chart: {
        type: "column",
        },
        title: { text: "Policy Lock Status", align: "left" },
        xAxis: {
        categories: ["Computer", "Server"],
        },
        yAxis: {
        min: 0,
        title: {
            text: "Count",
        },
        allowDecimals: false,
        },
        colors: ["#307DBC", "#51B6FD"],
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
            name: "Locked",
            data: [computerPolicyLocked, serverPolicyLocked],
        },
        {
            name: "Unlocked",
            data: [computerPolicyUnlocked, serverPolicyUnlocked],
        },
        ],
    });
}

async function renderPolicyNotRecommended(data) {
    const policy = data.endpoint.policy;

    Highcharts.chart("policyNotOnRecommended", {
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
    title: { text: "Policy Not On Recommanded", align: "left" },
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
        name: "Endpoint Status",
        colorByPoint: true,
        innerSize: "60%",
        colors: ["#B87F18", "#E4CE2C"],
        data: [
            {
            name: "Computer",
            y: policy.computer["threat-protection"].notOnRecommended,
            },
            {
            name: "Server",
            y: policy.server["server-threat-protection"].notOnRecommended,
            },
        ],
        },
    ],
    });
}

async function renderSnoozeFeatures(data) {
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
}

function renderTamperProtectionStatus(data) {
    const tamperProtection = data.endpoint.tamperProtection;

    Highcharts.chart("tamperProtectionStatus", {
    chart: {
        type: "column",
    },
    title: { text: "Tamper Protection Status", align: "left" },
    xAxis: {
        categories: ["Computer", "Server"],
    },
    yAxis: {
        min: 0,
        title: {
        text: "Count",
        },
        allowDecimals: false,
    },
    colors: ["#7FBC4F", "#DD3F3E"],
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
        name: "Enabled",
        data: [
            tamperProtection.computer.total -
            tamperProtection.computer.disabled,
            tamperProtection.server.total - tamperProtection.server.disabled,
        ],
        },
        {
        name: "Disabled",
        data: [
            tamperProtection.computer.disabled,
            tamperProtection.server.disabled,
        ],
        },
    ],
    });
}