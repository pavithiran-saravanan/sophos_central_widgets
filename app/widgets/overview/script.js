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