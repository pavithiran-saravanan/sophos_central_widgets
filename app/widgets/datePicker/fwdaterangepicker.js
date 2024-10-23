//ignorei18n_start
/**
* @version: 3.0.0
* @author: Dan Grossman http://www.dangrossman.info/
* @copyright: Copyright (c) 2012-2018 Dan Grossman. All rights reserved.
* @license: Licensed under the MIT license. See http://www.opensource.org/licenses/mit-license.php
* @website: http://www.daterangepicker.com/
*/
// Following the UMD template https://github.com/umdjs/umd/blob/master/templates/returnExportsGlobal.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Make globaly available as well
        define(['moment', 'jquery'], function (moment, jquery) {
            if (!jquery.fn){ jquery.fn = {};  }// webpack server rendering
            return factory(moment, jquery);
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node / Browserify
        //isomorphic issue
        var jQuery = (typeof window != 'undefined') ? window.jQuery : undefined;
        if (!jQuery) {
            jQuery = require('jquery');
            if (!jQuery.fn){ jQuery.fn = {};}
        }
        var moment = (typeof window != 'undefined' && typeof window.moment != 'undefined') ? window.moment : require('moment');
        module.exports = factory(moment, jQuery);
    } else {
        // Browser globals
        root.fwdaterangepicker = factory(root.moment, root.jQuery);
    }
}(this, function(moment, $) {
    var FWDateRangePicker = function(element, options, cb) {

        //default settings for options
        this.parentEl = 'body';
        this.element = $(element);
        this.startDate = moment().startOf('day');
        this.endDate = moment().endOf('day');
        this.minDate = false;
        this.maxDate = false;
        this.maxSpan = false;
        this.autoApply = false;
        this.basePickerClass = 'fwdaterangepicker';
        this.singleDatePicker = false;
        this.showDropdowns = false;
        this.showChips = false;
        this.dateFormatValidation = true;
        this.minYear = moment().subtract(100, 'year').format('YYYY');
        this.maxYear = moment().add(100, 'year').format('YYYY');
        this.showWeekNumbers = false;
        this.showISOWeekNumbers = false;
        this.showCustomRangeLabel = true;
        this.timePicker = false;
        this.timePicker24Hour = false;
        this.timePickerIncrement = 1;
        this.timePickerSeconds = false;
        this.linkedCalendars = true;
        this.autoUpdateInput = true;
        this.alwaysShowCalendars = false;
        this.weekPicker = false;

        this.ranges = {};

        this.opens = 'right';
        if (this.element.hasClass('pull-right')){
            this.opens = 'left';
        }

        this.drops = 'down';
        if (this.element.hasClass('dropup')){
            this.drops = 'up';
        }

        this.buttonClasses = 'btn btn-sm';
        this.applyButtonClasses = 'btn-primary';
        this.cancelButtonClasses = 'btn-default';

        this.locale = {
            direction: 'ltr',
            format: moment.localeData().longDateFormat('L'),
            separator: ' - ',
            applyLabel: 'Apply',
            cancelLabel: 'Cancel',
            weekLabel: 'W',
            customRangeLabel: 'Custom Range',
            daysOfWeek: moment.weekdaysMin(),
            monthNames: moment.monthsShort(),
            firstDay: moment.localeData().firstDayOfWeek()
        };

        this.callback = function() { };

        //some state information
        this.isShowing = false;
        this.leftCalendar = {};
        this.rightCalendar = {};

        //custom options from user
        if (typeof options !== 'object' || options === null){
            options = {};
        }

        //allow setting options with data attributes
        //data-api options will be overwritten with custom javascript options
        options = $.extend(this.element.data(), options);


        if (!Array.prototype.indexOf)   //ie support
        {
          Array.prototype.indexOf = function(elt /*, from*/)
          {
            var len = this.length >>> 0;

            var from = Number(arguments[1]) || 0;
            from = (from < 0)
                 ? Math.ceil(from)
                 : Math.floor(from);
            if (from < 0){
              from += len;
            }

            for (; from < len; from++)
            {
              if (from in this &&
                  this[from] === elt){
                return from;
                }
            }
            return -1;
          };
        }

        String.prototype.replaceAt=function(index, replacement) {
            return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
        }
        //html template for the picker UI
        if (typeof options.template !== 'string' && !(options.template instanceof $)){
            options.template =
            '<div class="'+this.basePickerClass+'">' +
                '<div class="ranges"></div>' +
                '<div class="calendar left">' +
                    '<div class="calendar-table"></div>' +
                    '<div class="calendar-time"></div>' +
                '</div>' +
                '<div class="calendar right">' +
                    '<div class="calendar-table"></div>' +
                    '<div class="calendar-time"></div>' +
                '</div>' +
                '<div class="drp-buttons">' +
                    '<span class="drp-selected"></span>' +
                    '<button class="cancelBtn" type="button"></button>' +
                    '<button class="applyBtn" disabled="disabled" type="button"></button> ' +
                '</div>' +
            '</div>';
        }

        this.parentEl = (options.parentEl && $(options.parentEl).length) ? $(options.parentEl) : $(this.parentEl);
        this.container = $(options.template).appendTo(this.parentEl);

        //
        // handle all the possible options overriding defaults
        //

        if (typeof options.locale === 'object') {

            if (typeof options.locale.direction === 'string'){
                this.locale.direction = options.locale.direction;
            }

            if (typeof options.locale.format === 'string'){
                this.locale.format = options.locale.format;
            }

            if (typeof options.locale.separator === 'string'){
                this.locale.separator = options.locale.separator;
            }

            if (typeof options.locale.daysOfWeek === 'object'){
                this.locale.daysOfWeek = options.locale.daysOfWeek.slice();
            }

            if (typeof options.locale.monthNames === 'object'){
              this.locale.monthNames = options.locale.monthNames.slice();
            }

            if (typeof options.locale.firstDay === 'number'){
              this.locale.firstDay = options.locale.firstDay;
            }

            if (typeof options.locale.applyLabel === 'string'){
              this.locale.applyLabel = options.locale.applyLabel;
            }

            if (typeof options.locale.cancelLabel === 'string'){
              this.locale.cancelLabel = options.locale.cancelLabel;
            }

            if (typeof options.locale.weekLabel === 'string'){
              this.locale.weekLabel = options.locale.weekLabel;
            }

            if (typeof options.locale.customRangeLabel === 'string'){
                //Support unicode chars in the custom range name.
                var elem = document.createElement('textarea');
                elem.innerHTML = options.locale.customRangeLabel;
                var rangeHtml = elem.value;
                this.locale.customRangeLabel = rangeHtml;
            }
        }
        this.container.addClass(this.locale.direction);

        if (typeof options.startDate === 'string'){
            this.startDate = moment(options.startDate, this.locale.format);
        }

        if (typeof options.endDate === 'string'){
            this.endDate = moment(options.endDate, this.locale.format);
        }

        if (typeof options.minDate === 'string'){
            this.minDate = moment(options.minDate, this.locale.format);
        }

        if (typeof options.maxDate === 'string'){
            this.maxDate = moment(options.maxDate, this.locale.format);
        }

        if (typeof options.startDate === 'object'){
            this.startDate = moment(options.startDate);
        }

        if (typeof options.endDate === 'object'){
            this.endDate = moment(options.endDate);
        }

        if (typeof options.minDate === 'object'){
            this.minDate = moment(options.minDate);
        }

        if (typeof options.maxDate === 'object'){
            this.maxDate = moment(options.maxDate);
        }

        // sanity check for bad options
        if (this.minDate && this.startDate.isBefore(this.minDate)){
            this.startDate = this.minDate.clone();
        }

        // sanity check for bad options
        if (this.maxDate && this.endDate.isAfter(this.maxDate)){
            this.endDate = this.maxDate.clone();
        }

        if (typeof options.applyButtonClasses === 'string'){
            this.applyButtonClasses = options.applyButtonClasses;
        }

        if (typeof options.applyClass === 'string'){ //backwards compat
            this.applyButtonClasses = options.applyClass;
        }

        if (typeof options.cancelButtonClasses === 'string'){
            this.cancelButtonClasses = options.cancelButtonClasses;
        }

        if (typeof options.cancelClass === 'string'){ //backwards compat
            this.cancelButtonClasses = options.cancelClass;
        }

        if (typeof options.maxSpan === 'object'){
            this.maxSpan = options.maxSpan;
        }

        if (typeof options.dateLimit === 'object'){ //backwards compat
            this.maxSpan = options.dateLimit;
        }

        if (typeof options.opens === 'string'){
            this.opens = options.opens;
        }

        if (typeof options.drops === 'string'){
            this.drops = options.drops;
        }

        if (typeof options.showWeekNumbers === 'boolean'){
            this.showWeekNumbers = options.showWeekNumbers;
        }

        if (typeof options.showISOWeekNumbers === 'boolean'){
            this.showISOWeekNumbers = options.showISOWeekNumbers;
        }

        if (typeof options.buttonClasses === 'string'){
            this.buttonClasses = options.buttonClasses;
        }

        if (typeof options.basePickerClass === 'string'){
            this.basePickerClass = options.basePickerClass;
        }

        if (typeof options.buttonClasses === 'object'){
            this.buttonClasses = options.buttonClasses.join(' ');
        }

        if (typeof options.showDropdowns === 'boolean'){
            this.showDropdowns = options.showDropdowns;
        }

        if (typeof options.showChips === 'boolean'){
            this.showChips = options.showChips;
        }

        if (typeof options.dateFormatValidation === 'boolean'){
            this.dateFormatValidation = options.dateFormatValidation;
        }

        if (typeof options.minYear === 'number'){
            this.minYear = options.minYear;
        }

        if (typeof options.maxYear === 'number'){
            this.maxYear = options.maxYear;
        }

        if (typeof options.showCustomRangeLabel === 'boolean'){
            this.showCustomRangeLabel = options.showCustomRangeLabel;
        }

        if (typeof options.singleDatePicker === 'boolean') {
            this.singleDatePicker = options.singleDatePicker;
            if (this.singleDatePicker){
                this.endDate = this.startDate.clone();
            }
        }

        if (typeof options.timePicker === 'boolean'){
            this.timePicker = options.timePicker;
        }
        if (typeof options.weekPicker === 'boolean'){
            this.weekPicker = options.weekPicker;
        }

        if (typeof options.timePickerSeconds === 'boolean'){
            this.timePickerSeconds = options.timePickerSeconds;
        }

        if (typeof options.timePickerIncrement === 'number'){
            this.timePickerIncrement = options.timePickerIncrement;
        }

        if (typeof options.timePicker24Hour === 'boolean'){
            this.timePicker24Hour = options.timePicker24Hour;
        }

        if (typeof options.autoApply === 'boolean'){
            this.autoApply = options.autoApply;
        }

        if (typeof options.autoUpdateInput === 'boolean'){
            this.autoUpdateInput = options.autoUpdateInput;
        }

        if (typeof options.linkedCalendars === 'boolean'){
            this.linkedCalendars = options.linkedCalendars;
        }

        if (typeof options.isInvalidDate === 'function'){
            this.isInvalidDate = options.isInvalidDate;
        }

        if (typeof options.isCustomDate === 'function'){
            this.isCustomDate = options.isCustomDate;
        }

        if (typeof options.alwaysShowCalendars === 'boolean'){
            this.alwaysShowCalendars = options.alwaysShowCalendars;
        }

        // update day names order to firstDay
        if (this.locale.firstDay != 0) {
            var iterator = this.locale.firstDay;
            while (iterator > 0) {
                this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
                iterator--;
            }
        }

        var start, end, range;

        //if no start/end dates set, check if an input element contains initial values
        if (typeof options.startDate === 'undefined' && typeof options.endDate === 'undefined') {
            if ($(this.element).is('input[type=text]')) {
                var val = $(this.element).val(),
                    split = val.split(this.locale.separator);

                start = end = null;

                if (split.length == 2) {
                    start = moment(split[0], this.locale.format);
                    end = moment(split[1], this.locale.format);
                } else if (this.singleDatePicker && val !== "") {
                    start = moment(val, this.locale.format);
                    end = moment(val, this.locale.format);
                }
                if (start !== null && end !== null) {
                    this.setStartDate(start);
                    this.setEndDate(end);
                }
            }
        }

        if (typeof options.ranges === 'object') {
            for (range in options.ranges) {

                if (typeof options.ranges[range][0] === 'string'){
                    start = moment(options.ranges[range][0], this.locale.format);
                }
                else{
                    start = moment(options.ranges[range][0]);
                }

                if (typeof options.ranges[range][1] === 'string'){
                    end = moment(options.ranges[range][1], this.locale.format);
                }
                else{
                    end = moment(options.ranges[range][1]);
                }

                // If the start or end date exceed those allowed by the minDate or maxSpan
                // options, shorten the range to the allowable period.
                if (this.minDate && start.isBefore(this.minDate)){
                    start = this.minDate.clone();
                }

                var maxDate = this.maxDate;
                if (this.maxSpan && maxDate && start.clone().add(this.maxSpan).isAfter(maxDate)){
                    maxDate = start.clone().add(this.maxSpan);
                }
                if (maxDate && end.isAfter(maxDate)){
                    end = maxDate.clone();
                }

                // If the end of the range is before the minimum or the start of the range is
                // after the maximum, don't display this range option at all.
                if ((this.minDate && end.isBefore(this.minDate, this.timepicker ? 'minute' : 'day'))
                  || (maxDate && start.isAfter(maxDate, this.timepicker ? 'minute' : 'day'))){
                    continue;
                }

                //Support unicode chars in the range names.
                var elem = document.createElement('textarea');
                elem.innerHTML = range;
                var rangeHtml = elem.value;

                this.ranges[rangeHtml] = [start, end];
            }

            var list = '<ul>';
            for (range in this.ranges) {
                list += '<li data-range-key="' + range + '">' + range + '</li>';
            }
            if (this.showCustomRangeLabel) {
                list += '<li data-range-key="' + this.locale.customRangeLabel + '">' + this.locale.customRangeLabel + '</li>';
            }
            list += '</ul>';
            this.container.find('.ranges').prepend(list);
        }

        if (typeof cb === 'function') {
            this.callback = cb;
        }

        if (!this.timePicker) {
            this.startDate = this.startDate.startOf('day');
            this.endDate = this.endDate.endOf('day');
            this.container.find('.calendar-time').hide();
        }

        //can't be used together for now
        if (this.timePicker && this.autoApply){
            this.autoApply = false;
        }

        if (this.autoApply) {
            this.container.addClass('auto-apply');
        }

        if (typeof options.ranges === 'object'){
            this.container.addClass('show-ranges');
        }

        if (this.singleDatePicker) {
            this.container.addClass('single');
            this.container.find('.calendar.left').addClass('single');
            this.container.find('.calendar.left').show();
            this.container.find('.calendar.right').hide();
            this.container.find('.daterangepicker_input input, .daterangepicker_input i').hide();
            if (!this.timePicker) {
                this.container.addClass('auto-apply');
            }
        }

        if ((typeof options.ranges === 'undefined' && !this.singleDatePicker) || this.alwaysShowCalendars) {
            this.container.addClass('show-calendar');
        }

        this.container.addClass('opens' + this.opens);

        //apply CSS classes and labels to buttons
        this.container.find('.applyBtn, .cancelBtn').addClass(this.buttonClasses);
        if (this.applyButtonClasses.length){
            this.container.find('.applyBtn').addClass(this.applyButtonClasses);
        }
        if (this.cancelButtonClasses.length){
            this.container.find('.cancelBtn').addClass(this.cancelButtonClasses);
        }
        this.container.find('.applyBtn').html(this.locale.applyLabel);
        this.container.find('.cancelBtn').html(this.locale.cancelLabel);

        //
        // event listeners
        //

        this.container.find('.calendar')
            .on('click.'+this.basePickerClass, '.prev', $.proxy(this.clickPrev, this))
            .on('click.'+this.basePickerClass, '.next', $.proxy(this.clickNext, this))
            .on('click.'+this.basePickerClass, 'th.month', $.proxy(this.showChipOptions, this))
            .on('mousedown.'+this.basePickerClass, 'td.available', $.proxy(this.clickDate, this))
            .on('mouseenter.'+this.basePickerClass, 'td.available', $.proxy(this.hoverDate, this))
            .on('mouseleave.'+this.basePickerClass, 'td.available', $.proxy(this.updateFormInputs, this))
            .on('change.'+this.basePickerClass, 'select.yearselect', $.proxy(this.monthOrYearChanged, this))
            .on('change.'+this.basePickerClass, 'select.monthselect', $.proxy(this.monthOrYearChanged, this))
            .on('click.'+this.basePickerClass, 'ul.monthselect li', $.proxy(this.chipMonthSelect, this))
            .on('click.'+this.basePickerClass, 'ul.yearselectContainer li', $.proxy(this.chipYearSelect, this))
            .on('change.'+this.basePickerClass, 'select.hourselect,select.minuteselect,select.secondselect,select.ampmselect', $.proxy(this.timeChanged, this))
            .on('click.'+this.basePickerClass, '.daterangepicker_input input', $.proxy(this.showCalendars, this))
            .on('change.'+this.basePickerClass, '.daterangepicker_input input', $.proxy(this.formInputsChanged, this))
            .on('keydown.'+this.basePickerClass, '.daterangepicker_input input', $.proxy(this.validateFormInputs, this))
            .on('mouseup.'+this.basePickerClass, '.daterangepicker_input input', $.proxy(this.highlightFormInput, this))
            .on('keyup.'+this.basePickerClass, '.daterangepicker_input input', $.proxy(this.highlightFormInput, this))
            .on('blur.'+this.basePickerClass, '.daterangepicker_input input', $.proxy(this.removeHighlight, this))
            .on('select.'+this.basePickerClass, '.daterangepicker_input input', $.proxy(this.formInputSelection, this))

        this.container.find('.ranges')
            .on('click.'+this.basePickerClass, 'li', $.proxy(this.clickRange, this))

        this.container.find('.drp-buttons')
            .on('click.'+this.basePickerClass, 'button.applyBtn', $.proxy(this.clickApply, this))
            .on('click.'+this.basePickerClass, 'button.cancelBtn', $.proxy(this.clickCancel, this))

        if (this.element.is('input') || this.element.is('button')) {
            var events = {};
            events['click.'+this.basePickerClass] = $.proxy(this.show, this);
            events['focus.'+this.basePickerClass] = $.proxy(this.show, this);
            events['keyup.'+this.basePickerClass] = $.proxy(this.elementChanged, this);
            events['keydown.'+this.basePickerClass] = $.proxy(this.keydown, this);
            this.element.on(events);
        } else {
            this.element.on('click.'+this.basePickerClass, $.proxy(this.toggle, this));
            this.element.on('keydown.'+this.basePickerClass, $.proxy(this.toggle, this));
        }

        //
        // if attached to a text input, set the initial value
        //

        if (this.element.is('input') && !this.singleDatePicker && this.autoUpdateInput) {
            this.element.val(this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format));
            this.element.trigger('change');
        } else if (this.element.is('input') && this.autoUpdateInput) {
            this.element.val(this.startDate.format(this.locale.format));
            this.element.trigger('change');
        }

    };

    FWDateRangePicker.prototype = {

        constructor: FWDateRangePicker,

        setStartDate: function(startDate) {
            if (typeof startDate === 'string'){
                this.startDate = moment(startDate, this.locale.format);
            }

            if (typeof startDate === 'object'){
                this.startDate = moment(startDate);
            }

            if (!this.timePicker){
                this.startDate = this.startDate.startOf('day');
            }

            if (this.timePicker && this.timePickerIncrement){
                this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
            }

            if (this.minDate && this.startDate.isBefore(this.minDate)) {
                this.startDate = this.minDate.clone();
                if (this.timePicker && this.timePickerIncrement){
                    this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
                }
            }

            if (this.maxDate && this.startDate.isAfter(this.maxDate)) {
                this.startDate = this.maxDate.clone();
                if (this.timePicker && this.timePickerIncrement){
                    this.startDate.minute(Math.floor(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
                }
            }

            if (!this.isShowing){
                this.updateElement();
            }

            this.updateMonthsInView();
        },

        setEndDate: function(endDate) {
            if (typeof endDate === 'string'){
                this.endDate = moment(endDate, this.locale.format);
            }

            if (typeof endDate === 'object'){
                this.endDate = moment(endDate);
            }

            if (!this.timePicker){
                this.endDate = this.endDate.add(1,'d').startOf('day').subtract(1,'second');
            }

            if (this.timePicker && this.timePickerIncrement){
                this.endDate.minute(Math.round(this.endDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
            }

            if (this.endDate.isBefore(this.startDate)){
                this.endDate = this.startDate.clone();
            }

            if (this.maxDate && this.endDate.isAfter(this.maxDate)){
                this.endDate = this.maxDate.clone();
            }

            if (this.maxSpan && this.startDate.clone().add(this.maxSpan).isBefore(this.endDate)){
                this.endDate = this.startDate.clone().add(this.maxSpan);
            }

            this.previousRightTime = this.endDate.clone();

            this.container.find('.drp-selected').html(this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format));

            if (!this.isShowing){
                this.updateElement();
            }

            this.updateMonthsInView();
        },

        isInvalidDate: function() {
            return false;
        },

        isCustomDate: function() {
            return false;
        },

        updateView: function() {
            if (this.timePicker) {
                this.renderTimePicker('left');
                this.renderTimePicker('right');
                if (!this.endDate) {
                    this.container.find('.right .calendar-time select').attr('disabled', 'disabled').addClass('disabled');
                } else {
                    this.container.find('.right .calendar-time select').removeAttr('disabled').removeClass('disabled');
                }
            }
            if (this.endDate){
                this.container.find('.drp-selected').html(this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format));
            }
            this.updateMonthsInView();
            this.updateCalendars();
            this.updateFormInputs();
        },

        updateMonthsInView: function() {
            if (this.endDate) {

                //if both dates are visible already, do nothing
                if (!this.singleDatePicker && this.leftCalendar.month && this.rightCalendar.month &&
                    (this.startDate.format('YYYY-MM') == this.leftCalendar.month.format('YYYY-MM'))
                    &&
                    (this.endDate.format('YYYY-MM') == this.rightCalendar.month.format('YYYY-MM'))
                    ) {
                    return;
                }

                this.leftCalendar.month = this.startDate.clone().date(2);
                if (!this.linkedCalendars && (this.endDate.month() != this.startDate.month() || this.endDate.year() != this.startDate.year())) {
                    this.rightCalendar.month = this.endDate.clone().date(2);
                } else {
                    this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
                }

            } else {
                if (this.leftCalendar.month.format('YYYY-MM') != this.startDate.format('YYYY-MM') && this.rightCalendar.month.format('YYYY-MM') != this.startDate.format('YYYY-MM')) {
                    this.leftCalendar.month = this.startDate.clone().date(2);
                    this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
                }
            }
            if (this.maxDate && this.linkedCalendars && !this.singleDatePicker && this.rightCalendar.month > this.maxDate) {
              this.rightCalendar.month = this.maxDate.clone().date(2);
              this.leftCalendar.month = this.maxDate.clone().date(2).subtract(1, 'month');
            }
        },

        updateCalendars: function() {

            if (this.timePicker) {
                var hour, minute, second;
                if (this.endDate) {
                    hour = parseInt(this.container.find('.left select.hourselect').val(), 10);
                    minute = parseInt(this.container.find('.left select.minuteselect').val(), 10);
                    second = this.timePickerSeconds ? parseInt(this.container.find('.left select.secondselect').val(), 10) : 0;
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.left select.ampmselect').val();
                        if (ampm === 'PM' && hour < 12){
                            hour += 12;
                        }
                        if (ampm === 'AM' && hour === 12){
                            hour = 0;
                        }
                    }
                } else {
                    hour = parseInt(this.container.find('.right select.hourselect').val(), 10);
                    minute = parseInt(this.container.find('.right select.minuteselect').val(), 10);
                    second = this.timePickerSeconds ? parseInt(this.container.find('.right select.secondselect').val(), 10) : 0;
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.right select.ampmselect').val();
                        if (ampm === 'PM' && hour < 12){
                            hour += 12;
                        }
                        if (ampm === 'AM' && hour === 12){
                            hour = 0;
                        }
                    }
                }
                this.leftCalendar.month.hour(hour).minute(minute).second(second);
                this.rightCalendar.month.hour(hour).minute(minute).second(second);
            }

            this.renderCalendar('left');
            this.renderCalendar('right');

            //highlight any predefined range matching the current start and end dates
            this.container.find('.ranges li').removeClass('active');
            if (this.endDate == null){ return;}

            this.calculateChosenLabel();
        },

        renderCalendar: function(side) {

            //
            // Build the matrix of dates that will populate the calendar
            //

            var calendar = side == 'left' ? this.leftCalendar : this.rightCalendar;
            var month = calendar.month.month();
            var year = calendar.month.year();
            var hour = calendar.month.hour();
            var minute = calendar.month.minute();
            var second = calendar.month.second();
            var daysInMonth = moment([year, month]).daysInMonth();
            var firstDay = moment([year, month, 1]);
            var lastDay = moment([year, month, daysInMonth]);
            var lastMonth = moment(firstDay).subtract(1, 'month').month();
            var lastYear = moment(firstDay).subtract(1, 'month').year();
            var daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();
            var dayOfWeek = firstDay.day();

            //initialize a 6 rows x 7 columns array for the calendar
            var calendar = [];
            calendar.firstDay = firstDay;
            calendar.lastDay = lastDay;

            for (var i = 0; i < 6; i++) {
                calendar[i] = [];
            }

            //populate the calendar with date objects
            var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
            if (startDay > daysInLastMonth){
                startDay -= 7;
            }

            if (dayOfWeek == this.locale.firstDay){
                startDay = daysInLastMonth - 6;
            }

            var curDate = moment([lastYear, lastMonth, startDay, 12, minute, second]);

            var col, row;
            for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add(24, 'hour')) {
                if (i > 0 && col % 7 === 0) {
                    col = 0;
                    row++;
                }
                calendar[row][col] = curDate.clone().hour(hour).minute(minute).second(second);
                curDate.hour(12);

                if (this.minDate && calendar[row][col].format('YYYY-MM-DD') == this.minDate.format('YYYY-MM-DD') && calendar[row][col].isBefore(this.minDate) && side == 'left') {
                    calendar[row][col] = this.minDate.clone();
                }

                if (this.maxDate && calendar[row][col].format('YYYY-MM-DD') == this.maxDate.format('YYYY-MM-DD') && calendar[row][col].isAfter(this.maxDate) && side == 'right') {
                    calendar[row][col] = this.maxDate.clone();
                }

            }

            //make the calendar object available to hoverDate/clickDate
            if (side == 'left') {
                this.leftCalendar.calendar = calendar;
            } else {
                this.rightCalendar.calendar = calendar;
            }

            //
            // Display the calendar
            //

            var minDate = side == 'left' ? this.minDate : this.startDate;
            var maxDate = this.maxDate;
            var selected = side == 'left' ? this.startDate : this.endDate;
            var arrow = this.locale.direction == 'ltr' ? {left: 'chevron-left', right: 'chevron-right'} : {left: 'chevron-right', right: 'chevron-left'};

            var html = '<table class="table-condensed">';
            html += '<thead>';
            html += '<tr>';

            // add empty cell for week number
            if (this.showWeekNumbers || this.showISOWeekNumbers){
                html += '<th></th>';
            }

            var dateHtml = this.locale.monthNames[calendar[1][1].month()] + calendar[1][1].format(" YYYY");

            if (this.showDropdowns) {
                var currentMonth = calendar[1][1].month();
                var currentYear = calendar[1][1].year();
                var maxYear = (maxDate && maxDate.year()) || (this.maxYear);
                var minYear = (minDate && minDate.year()) || (this.minYear);
                var inMinYear = currentYear == minYear;
                var inMaxYear = currentYear == maxYear;

                var monthHtml = '<select class="monthselect">';
                for (var m = 0; m < 12; m++) {
                    if ((!inMinYear || m >= minDate.month()) && (!inMaxYear || m <= maxDate.month())) {
                        monthHtml += "<option value='" + m + "'" +
                            (m === currentMonth ? " selected='selected'" : "") +
                            ">" + this.locale.monthNames[m] + "</option>";
                    } else {
                        monthHtml += "<option value='" + m + "'" +
                            (m === currentMonth ? " selected='selected'" : "") +
                            " disabled='disabled'>" + this.locale.monthNames[m] + "</option>";
                    }
                }
                monthHtml += "</select>";

                var yearHtml = '<select class="yearselect">';
                for (var y = minYear; y <= maxYear; y++) {
                    yearHtml += '<option value="' + y + '"' +
                        (y === currentYear ? ' selected="selected"' : '') +
                        '>' + y + '</option>';
                }
                yearHtml += '</select>';

                dateHtml = monthHtml + yearHtml;
            }

            if(this.showChips){
                var currentMonth = calendar[1][1].month();
                var currentYear = calendar[1][1].year();
                var maxYear = (maxDate && maxDate.year()) || (this.maxYear);
                var minYear = (minDate && minDate.year()) || (this.minYear);
                var inMinYear = currentYear == minYear;
                var inMaxYear = currentYear == maxYear;
                if(!maxDate){
                    maxDate = new moment(this.maxYear+"-01-01")
                }
                if(!minDate){
                    minDate = new moment(this.minYear+"-01-01")
                }
                dateHtml = this.locale.monthNames[calendar[1][1].month()] + calendar[1][1].format(" YYYY") + '<i class="daterangepicker-icon date-caret"></i>';
                var monthHtml = '<ul class="monthselect">';
                var monthSelect = '<select class="chip-select monthselect">';
                for (var m = 0; m < 12; m++) {
                    if ((!inMinYear || m >= minDate.month()) && (!inMaxYear || m <= maxDate.month())) {
                        monthHtml += "<li value='" + m + "'" +
                            (m === currentMonth ? " class='selected'" : "") +
                            ">" + this.locale.monthNames[m] + "</li>";
                        monthSelect += "<option value='" + m + "'" +
                            (m === currentMonth ? " selected='selected'" : "") +
                            ">" + this.locale.monthNames[m] + "</option>";
                    } else {
                        monthHtml += "<li value='" + m + "'" +
                            (m === currentMonth ? " class='selected'" : "") +
                            " disabled='disabled'>" + this.locale.monthNames[m] + "</option>";
                        monthSelect += "<option value='" + m + "'" +
                            (m === currentMonth ? " selected='selected'" : "") +
                            " disabled='disabled'>" + this.locale.monthNames[m] + "</option>";
                    }
                }
                monthSelect += "</select>";
                monthHtml += "</ul>";
                html += monthSelect;
                html += monthHtml;

                var yearHtml;
                var yearSelect = '<select class="chip-select yearselect">';
                for (var y = minYear, i =1, j=1; y <= maxYear; y++, i++) {
                    if(i%20 == 1){
                        yearHtml = '<ul class="yearselectContainer yearSplit-'+j+'">';
                        j++;
                    }
                    yearHtml += '<li value="' + y + '"' +
                        (y === currentYear ? ' class="selected"' : '') +
                        '>' + y + '</li>';
                    if(i%20 == 0){
                        yearHtml += '</ul>'
                        html += yearHtml;
                    }
                    yearSelect += '<option value="' + y + '"' +
                        (y === currentYear ? ' selected="selected"' : '') +
                        '>' + y + '</option>';
                }
                yearSelect += '</select>';
                html += yearSelect;
                html += yearHtml;
            }

            html += '<th colspan="5" class="month">' + dateHtml + '</th>';

            if ((!minDate || minDate.isBefore(calendar.firstDay)) && (!this.linkedCalendars || side == 'left')) {
                html += '<th class="prev available"><span></span></th>';
            } else {
                html += '<th class="prev available disabled"><span></span></th>';
            }

            if ((!maxDate || maxDate.isAfter(calendar.lastDay)) && (!this.linkedCalendars || side == 'right' || this.singleDatePicker)) {
                html += '<th class="next available"><span></span></th>';
            } else {
                html += '<th class="next available disabled"><span></span></th>';
            }

            html += '</tr>';
            html += '<tr>';

            // add week number label
            if (this.showWeekNumbers || this.showISOWeekNumbers){
                html += '<th class="week">' + this.locale.weekLabel + '</th>';
            }

            $.each(this.locale.daysOfWeek, function(index, dayOfWeek) {
                html += '<th>' + dayOfWeek + '</th>';
            });

            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';

            //adjust maxDate to reflect the maxSpan setting in order to
            //grey out end dates beyond the maxSpan
            if (this.endDate == null && this.maxSpan) {
                var maxLimit = this.startDate.clone().add(this.maxSpan).endOf('day');
                if (!maxDate || maxLimit.isBefore(maxDate)) {
                    maxDate = maxLimit;
                }
            }

            for (var row = 0; row < 6; row++) {
                html += '<tr>';

                // add week number
                if (this.showWeekNumbers){
                    html += '<td class="week">' + calendar[row][0].week() + '</td>';
                }
                else if (this.showISOWeekNumbers){
                    html += '<td class="week">' + calendar[row][0].isoWeek() + '</td>';
                }

                for (var col = 0; col < 7; col++) {

                    var classes = [];

                    //highlight today's date
                    if (calendar[row][col].isSame(new Date(), "day")){
                        classes.push('today');
                    }

                    //highlight weekends
                    if (calendar[row][col].isoWeekday() > 5){
                        classes.push('weekend');
                    }

                    //grey out the dates in other months displayed at beginning and end of this calendar
                    if (calendar[row][col].month() != calendar[1][1].month()){
                        classes.push('off');
                    }

                    //don't allow selection of dates before the minimum date
                    if (this.minDate && calendar[row][col].isBefore(this.minDate, 'day')){
                        classes.push('off', 'disabled');
                    }

                    //don't allow selection of dates after the maximum date
                    if (maxDate && calendar[row][col].isAfter(maxDate, 'day')){
                        classes.push('off', 'disabled');
                    }

                    //don't allow selection of date if a custom function decides it's invalid
                    if (this.isInvalidDate(calendar[row][col])){
                        classes.push('off', 'disabled');
                    }

                    //highlight the currently selected start date
                    if (calendar[row][col].format('YYYY-MM-DD') == this.startDate.format('YYYY-MM-DD')){
                        classes.push('active', 'start-date');
                    }

                    //highlight the currently selected end date
                    if (this.endDate != null && calendar[row][col].format('YYYY-MM-DD') == this.endDate.format('YYYY-MM-DD')){
                        classes.push('active', 'end-date');
                    }

                    //highlight dates in-between the selected dates
                    if (this.endDate != null && calendar[row][col] > this.startDate && calendar[row][col] < this.endDate){
                        classes.push('in-range');
                    }

                    //apply custom classes for this date
                    var isCustom = this.isCustomDate(calendar[row][col]);
                    if (isCustom !== false) {
                        if (typeof isCustom === 'string'){
                            classes.push(isCustom);
                        }
                        else{
                            Array.prototype.push.apply(classes, isCustom);
                        }
                    }

                    var cname = '', disabled = false;
                    for (var i = 0; i < classes.length; i++) {
                        cname += classes[i] + ' ';
                        if (classes[i] == 'disabled'){
                            disabled = true;
                        }
                    }
                    if (!disabled){
                        cname += 'available';
                    }

                    html += '<td class="' + cname.replace(/^\s+|\s+$/g, '') + '" data-title="' + 'r' + row + 'c' + col + '">' + calendar[row][col].date() + '</td>';

                }
                html += '</tr>';
            }

            html += '</tbody>';
            html += '</table>';

            this.container.find('.calendar.' + side + ' .calendar-table').html(html);

        },

        renderTimePicker: function(side) {

            // Don't bother updating the time picker if it's currently disabled
            // because an end date hasn't been clicked yet
            if (side == 'right' && !this.endDate){ return};

            var html, selected, minDate, maxDate = this.maxDate;

            if (this.maxSpan && (!this.maxDate || this.startDate.clone().add(this.maxSpan).isAfter(this.maxDate))){
                maxDate = this.startDate.clone().add(this.maxSpan);
            }

            if (side == 'left') {
                selected = this.startDate.clone();
                minDate = this.minDate;
            } else if (side == 'right') {
                selected = this.endDate.clone();
                minDate = this.startDate;

                //Preserve the time already selected
                var timeSelector = this.container.find('.calendar.right .calendar-time');
                if (timeSelector.html() != '') {

                    selected.hour(selected.hour() || timeSelector.find('select.hourselect option:selected').val());
                    selected.minute(selected.minute() || timeSelector.find('select.minuteselect option:selected').val());
                    selected.second(selected.second() || timeSelector.find('select.secondselect option:selected').val());

                    if (!this.timePicker24Hour) {
                        var ampm = timeSelector.find('select.ampmselect option:selected').val();
                        if (ampm === 'PM' && selected.hour() < 12){
                            selected.hour(selected.hour() + 12);
                        }
                        if (ampm === 'AM' && selected.hour() === 12){
                            selected.hour(0);
                        }
                    }

                }

                if (selected.isBefore(this.startDate)){
                    selected = this.startDate.clone();
                }

                if (maxDate && selected.isAfter(maxDate)){
                    selected = maxDate.clone();
                }

            }

            //
            // hours
            //

            html = '<div class="hourbox timebox"><select class="hourselect">';

            var start = this.timePicker24Hour ? 0 : 1;
            var end = this.timePicker24Hour ? 23 : 12;

            for (var i = start; i <= end; i++) {
                var i_in_24 = i;
                if (!this.timePicker24Hour){
                    i_in_24 = selected.hour() >= 12 ? (i == 12 ? 12 : i + 12) : (i == 12 ? 0 : i);
                }

                var time = selected.clone().hour(i_in_24);
                var disabled = false;
                if (minDate && time.minute(59).isBefore(minDate)){
                    disabled = true;
                }
                if (maxDate && time.minute(0).isAfter(maxDate)){
                    disabled = true;
                }

                if (i_in_24 == selected.hour() && !disabled) {
                    html += '<option value="' + i + '" selected="selected">' + i + '</option>';
                } else if (disabled) {
                    html += '<option value="' + i + '" disabled="disabled" class="disabled">' + i + '</option>';
                } else {
                    html += '<option value="' + i + '">' + i + '</option>';
                }
            }

            html += '</select></div>';

            //
            // minutes
            //

            html += ':<div class="minutebox timebox"><select class="minuteselect">';

            for (var i = 0; i < 60; i += this.timePickerIncrement) {
                var padded = i < 10 ? '0' + i : i;
                var time = selected.clone().minute(i);

                var disabled = false;
                if (minDate && time.second(59).isBefore(minDate)){
                    disabled = true;
                }
                if (maxDate && time.second(0).isAfter(maxDate)){
                    disabled = true;
                }

                if (selected.minute() == i && !disabled) {
                    html += '<option value="' + i + '" selected="selected">' + padded + '</option>';
                } else if (disabled) {
                    html += '<option value="' + i + '" disabled="disabled" class="disabled">' + padded + '</option>';
                } else {
                    html += '<option value="' + i + '">' + padded + '</option>';
                }
            }

            html += '</select></div>';

            //
            // seconds
            //

            if (this.timePickerSeconds) {
                html += ':<div class="secondbox timebox"><select class="secondselect">';

                for (var i = 0; i < 60; i++) {
                    var padded = i < 10 ? '0' + i : i;
                    var time = selected.clone().second(i);

                    var disabled = false;
                    if (minDate && time.isBefore(minDate)){
                        disabled = true;
                    }
                    if (maxDate && time.isAfter(maxDate)){
                        disabled = true;
                    }

                    if (selected.second() == i && !disabled) {
                        html += '<option value="' + i + '" selected="selected">' + padded + '</option>';
                    } else if (disabled) {
                        html += '<option value="' + i + '" disabled="disabled" class="disabled">' + padded + '</option>';
                    } else {
                        html += '<option value="' + i + '">' + padded + '</option>';
                    }
                }

                html += '</select></div>';
            }

            //
            // AM/PM
            //

            if (!this.timePicker24Hour) {
                html += '<div class="ampmbox timebox"><select class="ampmselect">';

                var am_html = '';
                var pm_html = '';

                if (minDate && selected.clone().hour(12).minute(0).second(0).isBefore(minDate)){
                    am_html = ' disabled="disabled" class="disabled"';
                }

                if (maxDate && selected.clone().hour(0).minute(0).second(0).isAfter(maxDate)){
                    pm_html = ' disabled="disabled" class="disabled"';
                }

                if (selected.hour() >= 12) {
                    html += '<option value="AM"' + am_html + '>AM</option><option value="PM" selected="selected"' + pm_html + '>PM</option>';
                } else {
                    html += '<option value="AM" selected="selected"' + am_html + '>AM</option><option value="PM"' + pm_html + '>PM</option>';
                }

                html += '</select></div>';
            }

            this.container.find('.calendar.' + side + ' .calendar-time').html(html);
            //this.container.find(".hourselect, .minuteselect, .secondselect, .ampmselect").selectpicker();

        },

        formInputsChanged: function(e) {
            var isRight = $(e.target).closest('.calendar').hasClass('right');
            var start = moment(this.container.find('input[name="daterangepicker_start"]').val(), this.locale.format);
            var end = moment(this.container.find('input[name="daterangepicker_end"]').val(), this.locale.format);

            if (start.isValid() && end.isValid()) {

                if (isRight && end.isBefore(start)){
                    start = end.clone();
                }

                this.setStartDate(start);
                this.setEndDate(end);

                if (isRight) {
                    this.container.find('input[name="daterangepicker_start"]').val(this.startDate.format(this.locale.format));
                } else {
                    this.container.find('input[name="daterangepicker_end"]').val(this.endDate.format(this.locale.format));
                }

            }

            this.updateCalendars();
            if (this.timePicker) {
                this.renderTimePicker('left');
                this.renderTimePicker('right');
            }
        },
        formInputSelection: function(e){
            e.target.selectionStart = e.target.selectionEnd;
        },
        getFormatedStringMap: function(value,pos){
            var first = value.substring(0, pos);
            var last = value.substring(pos);
            var firstIndex = 0,lastIndex;
            var firstChars=[],lastChar;
            var format = this.localeFormatedString.formatedString;
            for(var i=0;i<value.length;i++){
                if(first[i]){
                    if(!(/[A-Za-z0-9]/.test(first[i]))){
                        firstIndex = i;
                        firstChars.push(first[i]);
                    }
                }
                if(last[i]){
                    if(!(/[A-Za-z0-9]/.test(last[i]))){
                        if(lastIndex==undefined){
                            lastIndex = i;
                            lastChar = last[i];
                        }
                    }
                }
            }
            var formatIndex;
            for(var j=0;j<firstChars.length;j++){
                formatIndex = format.indexOf(firstChars[j],formatIndex+1);

            }
            var format = format.slice(formatIndex+1,format.length);

            var valMap = value.substring(firstIndex+(firstIndex==0?0:1),pos+lastIndex);

            if(valMap.length < this.localeFormatedString[format[0]].max){
                return {
                   "operation":"insert",
                   "format": format[0],
                   "type": this.localeFormatedString[format[0]].type
               };
            }else{
                if(lastIndex == 0){
                   format = format.substr(this.localeFormatedString[format[0]].max);
                   var formatText;
                   var skipCount;
                   for(var k=0;k<format.length;k++){
                      if(/[A-Za-z0-9]/.test(format[k])){
                        formatText = format[k];
                        skipCount = k;
                        break;
                      }
                   }
                   return {
                    "operation": "skip",
                    "skip": skipCount,
                    "format": formatText,
                    "type": this.localeFormatedString[formatText].type
                   };
                }else{
                    return{
                        "operation":"replace",
                        "format": format[0],
                        "type": this.localeFormatedString[format[0]].type
                    };
                }
            }
        },
        validateFormInputs: function(e){
            this.getFormatedDateString(this.locale.format);
            if(this.dateFormatValidation){
                //validation not works on text format month eg. June or Jun //mathan.m@zohocorp.com
                var pattern = /[APMapm0-9]/; //validate only allows month in numberformat

                var formatSeperators = ["-",",","/"," ","+","_",":","."];
                formatSeperators = formatSeperators.concat(this.localeFormatedString.splChar.split(""));
                var keyString = e.key || String.fromCharCode(e.keyCode);
                var ipVal = $(e.target).val();
                var key = e.keyCode;
                var ip = e.target;
                var curPos = this.caretGet(ip);
                if(ipVal.length == 0){
                    ip.value = this.localeFormatedString.splChar?this.localeFormatedString.splChar:"";
                    this.caretSet(ip,0);
                }
                if(key == 8 || key == 127){ //backspace //backspace safari
                    if(formatSeperators.indexOf(ipVal[curPos-1]) != -1){
                        e.preventDefault();
                    }
                }else if(key == 9){
                    var lastIndex = 0;
                    for(var i=curPos;i<ipVal.length;i++){
                        if(!(/[A-Za-z0-9]/.test(ipVal[i]))){
                            lastIndex = i;
                            break;
                        }
                    }
                    this.caretSet(ip,lastIndex+1);
                    e.preventDefault();
                }
                else if(key == 46){//delete
                  if(formatSeperators.indexOf(ipVal[curPos]) != -1){
                      e.preventDefault();
                  }
                }else if(key == 39||key == 38||key == 37||key == 40||key==9){//arrow keys //tab key
                    return;
                }else{
                    if(ipVal.length >this.localeFormatedString.formatedString.length || curPos >= this.localeFormatedString.formatedString.length){
                        e.preventDefault();
                    }else{
                        var formatVar = this.getFormatedStringMap(ipVal,curPos);
                        if(formatVar.type == "string"){
                            pattern = /[A-Za-z]/;
                        }else{
                            pattern = /[0-9]/;
                        }
                        if(pattern.test(keyString)){
                            if(formatVar.operation == "replace"){
                                ip.value = this.remove_character(ipVal,curPos);
                                this.caretSet(ip,curPos);
                            }else if(formatVar.operation == "skip" && parseInt(formatVar.skip)){
                              curPos = curPos+formatVar.skip;
                              this.caretSet(ip,curPos);
                              formatVar = this.getFormatedStringMap(ipVal,curPos);
                              if(formatVar.type == "string"){
                                  pattern = /[A-Za-z]/;
                              }else{
                                  pattern = /[0-9]/;
                              }
                              if(pattern.test(keyString)){
                                if(formatVar.operation == "replace"){
                                  ip.value = this.remove_character(ipVal,curPos);
                                  this.caretSet(ip,curPos);
                                }else if(formatVar.operation == "insert"){

                                  if (document.selection) { //IE SUPPORT
                                      ip.focus();
                                      var oSet = document.selection.createRange();
                                      oSet.moveStart('character', 0-ip.value.length);
                                      oSet.moveStart('character', curPos);
                                      oSet.moveEnd('character', 0);
                                      oSet.select();
                                  }
                                }
                              }else{
                                e.preventDefault();
                              }
                            }
                        }else{
                            e.preventDefault();
                        }
                    }
                }
            }
        },
        highlightFormInput: function(e){
            this.getFormatedDateString(this.locale.format);
            var ip = e.target;
            var ipVal = $(e.target).val();
            var curPos = this.caretGet(ip);
            var formatVar = this.getFormatedStringMap(ipVal,curPos);
            var lastIndex = ipVal.length;
            var firstIndex = 0;
            var first = ipVal.substring(0, curPos);
            for(var i=curPos;i<ipVal.length;i++){
                if(!(/[A-Za-z0-9]/.test(ipVal[i]))){
                    lastIndex = i;
                    break;
                }
            }
            for(var j=first.length-1;j>=0;j--){
                if(!(/[A-Za-z0-9]/.test(first[j]))){
                    firstIndex = j;
                    break;
                }
            }
            var slot1 = "", slot2 = "", slot3 = "";
            if(firstIndex == 0){
                slot2 = ipVal.substring(firstIndex,lastIndex)
            }else{
                slot1 = ipVal.substring(0, firstIndex+1);
                slot2 = ipVal.substring(firstIndex+1,lastIndex)
            }
            if(lastIndex == ipVal.length-1){
                slot3 = ""
            }else{
                slot3 = ipVal.substring(lastIndex, ipVal.length);
            }
            var container = $("<div/>").addClass("date-highlight").html(slot1+"<span>"+slot2+"</span>"+slot3);
            var ipPicker = $(ip).closest(".daterangepicker_input");
            ipPicker.find(".date-highlight").remove()
            ipPicker.append(container);

        },
        removeHighlight: function(e){
            var ip = e.target;
             $(ip).closest(".daterangepicker_input").find(".date-highlight").remove();
        },
        getFormatedDateString: function(format){
            var uQchar = [];
            var splChar = [];
            var charCounts = {};
            for(var i=0;i<format.length;i++){
                if(/[a-zA-Z]/.test(format[i])){
                    if(uQchar.indexOf(format[i]) == -1){
                        uQchar.push(format[i])
                    }
                }else{
                    uQchar.push(format[i]);
                    splChar.push(format[i]);
                }
            }

            for(var j=0;j<uQchar.length;j++){
                if(/[a-zA-Z]/.test(format[i])){
                    var count = (format.match(new RegExp(uQchar[j], "g")) || []).length;
                    charCounts[uQchar[j]] ={
                        "min": count,
                        "max": (uQchar[j]=="D" || uQchar[j]=="M" || uQchar[j]=="A" || uQchar[j]=="a" || uQchar[j]=="h" || uQchar[j]=="m" || uQchar[j]=="s") && count == 1?2:count,
                        "type": (uQchar[j] == "M" && count >=3) || (uQchar[j] == "A" || uQchar[j] == "a") ?"string":"number"
                    };
                }
            }
            charCounts.formatedString = "";
            charCounts.splChar = splChar.join("");
            for(var j=0;j<uQchar.length;j++){
                if(/[a-zA-Z]/.test(uQchar[j])){
                    for(var z=0;z<charCounts[uQchar[j]].max;z++){
                        charCounts.formatedString += uQchar[j];
                    }
                }else{
                    charCounts.formatedString += uQchar[j];
                }
            }
            this.localeFormatedString = charCounts;
        },
        caretGet: function(el){
            var pos = 0;
            if (document.selection) {  //IE SUPPORT
                el.focus();
                var oSel = document.selection.createRange();
                oSel.moveStart('character', 0-el.value.length);
                pos = oSel.text.length;
            }else{
                pos = el.selectionStart;
            }
            return pos;
        },
        caretSet: function(el,pos){
            if (document.selection) { //IE SUPPORT
                el.focus();
                 var oSet = document.selection.createRange();
                 oSet.moveStart('character', 0-el.value.length);
                 oSet.moveStart('character', pos);
                 oSet.moveEnd('character', 0-el.value.length+pos);
                 oSet.select();
            }else{
                el.selectionStart = pos;
                el.selectionEnd = pos;
            }
        },
        remove_character: function(str, char_pos)
        {
            var part1 = str.substring(0, char_pos);
            var part2 = str.substring(char_pos + 1, str.length);
            return (part1 + part2);
        },
        updateFormInputs: function() {

            if (this.container.find('input[name=daterangepicker_start]').is(":focus") || this.container.find('input[name=daterangepicker_end]').is(":focus")){
                return;
            }

            this.container.find('input[name=daterangepicker_start]').val(this.startDate.format(this.locale.format));
            if (this.endDate){
                this.container.find('input[name=daterangepicker_end]').val(this.endDate.format(this.locale.format));
            }

            if (this.singleDatePicker || (this.endDate && (this.startDate.isBefore(this.endDate) || this.startDate.isSame(this.endDate)))) {
                this.container.find('button.applyBtn').removeAttr('disabled');
            } else {
                this.container.find('button.applyBtn').attr('disabled', 'disabled');
            }

        },

        move: function() {
            var parentOffset = { top: 0, left: 0 },
                containerTop;
            var parentRightEdge = $(window).width();
            if (!this.parentEl.is('body')) {
                parentOffset = {
                    top: this.parentEl.offset().top - this.parentEl.scrollTop(),
                    left: this.parentEl.offset().left - this.parentEl.scrollLeft()
                };
                parentRightEdge = this.parentEl[0].clientWidth + this.parentEl.offset().left;
            }

            if (this.drops == 'up'){
                containerTop = this.element.offset().top - this.container.outerHeight() - parentOffset.top;
            }
            else{
                containerTop = this.element.offset().top + this.element.outerHeight() - parentOffset.top;
            }
            this.container[this.drops == 'up' ? 'addClass' : 'removeClass']('drop-up');

            if (this.opens == 'left') {
                this.container.css({
                    top: containerTop,
                    right: parentRightEdge - this.element.offset().left - this.element.outerWidth(),
                    left: 'auto'
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: 'auto',
                        left: 9
                    });
                }
            } else if (this.opens == 'center') {
                this.container.css({
                    top: containerTop,
                    left: this.element.offset().left - parentOffset.left + this.element.outerWidth() / 2
                            - this.container.outerWidth() / 2,
                    right: 'auto'
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: 'auto',
                        left: 9
                    });
                }
            } else {
                this.container.css({
                    top: containerTop,
                    left: this.element.offset().left - parentOffset.left,
                    right: 'auto'
                });
                if (this.container.offset().left + this.container.outerWidth() > $(window).width()) {
                    this.container.css({
                        left: 'auto',
                        right: 0
                    });
                }
            }
        },

        show: function(e) {
            if (this.isShowing){return;}

            // Create a click proxy that is private to this instance of datepicker, for unbinding
            this._outsideClickProxy = $.proxy(function(e) { this.outsideClick(e); }, this);

            // Bind global datepicker mousedown for hiding and
            $(document)
              .on('mousedown.'+this.basePickerClass, this._outsideClickProxy)
              // also support mobile devices
              .on('touchend.'+this.basePickerClass, this._outsideClickProxy)
              // also explicitly play nice with Bootstrap dropdowns, which stopPropagation when clicking them
              .on('click.'+this.basePickerClass, '[data-toggle=dropdown]', this._outsideClickProxy)
              // and also close when focus changes to outside the picker (eg. tabbing between controls)
              .on('focusin.'+this.basePickerClass, this._outsideClickProxy);

            // Reposition the picker if the window is resized while it's open
            $(window).on('resize.'+this.basePickerClass, $.proxy(function(e) { this.move(e); }, this));

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();
            this.previousRightTime = this.endDate.clone();

            this.updateView();
            this.container.show();
            this.move();
            this.element.trigger('show.'+this.basePickerClass, this);
            this.isShowing = true;
        },

        hide: function(e) {
            if (!this.isShowing){return;}

            //incomplete date selection, revert to last values
            if (!this.endDate) {
                this.startDate = this.oldStartDate.clone();
                this.endDate = this.oldEndDate.clone();
            }

            //if a new date range was selected, invoke the user callback function
            if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate)){
                this.callback(this.startDate.clone(), this.endDate.clone(), this.chosenLabel);
            }

            //if picker is attached to a text input, update it
            this.updateElement();

            $(document).off('.'+this.basePickerClass);
            $(window).off('.'+this.basePickerClass);
            this.container.hide();
            this.element.trigger('hide.'+this.basePickerClass, this);
            this.isShowing = false;
        },

        toggle: function(e) {
            if (this.isShowing) {
                this.hide();
            } else {
                this.show();
            }
        },

        outsideClick: function(e) {
            var target = $(e.target);
            // if the page is clicked anywhere except within the daterangerpicker/button
            // itself then call this.hide()
            if (
                // ie modal dialog fix
                e.type == "focusin" ||
                target.closest(this.element).length ||
                target.closest(this.container).length ||
                target.closest('.calendar-table').length
                ){return;}
            this.hide();
            this.element.trigger('outsideClick.'+this.basePickerClass, this);
        },

        showCalendars: function() {
            this.container.addClass('show-calendar');
            this.move();
            this.element.trigger('showCalendar.'+this.basePickerClass, this);
        },

        hideCalendars: function() {
            this.container.removeClass('show-calendar');
            this.element.trigger('hideCalendar.'+this.basePickerClass, this);
        },

        clickRange: function(e) {
            var label = e.target.getAttribute('data-range-key');
            this.chosenLabel = label;
            if (label == this.locale.customRangeLabel) {
                this.showCalendars();
            } else {
                var dates = this.ranges[label];
                this.startDate = dates[0];
                this.endDate = dates[1];

                if (!this.timePicker) {
                    this.startDate.startOf('day');
                    this.endDate.endOf('day');
                }

                if (!this.alwaysShowCalendars){
                    this.hideCalendars();
                }
                this.clickApply();
            }
        },

        clickPrev: function(e) {

            var cal = $(e.target).parents('.calendar');
            if(this.showChips){
                var yearBox =  cal.find(".yearselectContainer.open");
                var maxYearbox = cal.find(".yearselectContainer").length;
                if(yearBox.length > 0){
                    var classList = $(yearBox).attr('class').replace("yearselectContainer","").replace("open","").replace("yearSplit-","").trim();
                    var index = parseInt(classList);
                    if(index!=NaN){
                        index--;
                        $(yearBox).removeClass("open");
                        if(index<1){
                            cal.find(".yearselectContainer.yearSplit-1").addClass("open");
                            cal.find(".prev").addClass("disabled");
                        }else{
                            cal.find(".yearselectContainer.yearSplit-"+index).addClass("open");
                        }
                        cal.find(".next").removeClass("disabled");
                        if(index >= maxYearbox){
                            cal.find(".next").addClass("disabled");
                        }
                    }
                    return;
                }
            }
            if(cal.find(".prev").hasClass("disabled")){
                return;
            }
            if (cal.hasClass('left')) {
                this.leftCalendar.month.subtract(1, 'month');
                if (this.linkedCalendars){
                    this.rightCalendar.month.subtract(1, 'month');
                }
            } else {
                this.rightCalendar.month.subtract(1, 'month');
            }
            this.updateCalendars();
        },

        clickNext: function(e) {
            var cal = $(e.target).parents('.calendar');
            if(this.showChips){
                var yearBox =  cal.find(".yearselectContainer.open");
                var maxYearbox = cal.find(".yearselectContainer").length;
                if(yearBox.length > 0){
                    var classList = $(yearBox).attr('class').replace("yearselectContainer","").replace("open","").replace("yearSplit-","").trim();
                    var index = parseInt(classList);
                    if(index!=NaN){
                        index++;
                        $(yearBox).removeClass("open");
                        if(index>=maxYearbox){
                            cal.find(".yearselectContainer.yearSplit-"+maxYearbox).addClass("open");
                            cal.find(".next").addClass("disabled");
                        }else{
                            cal.find(".yearselectContainer.yearSplit-"+index).addClass("open");
                        }
                        cal.find(".prev").removeClass("disabled");
                        if(index == 0){
                            cal.find(".prev").addClass("disabled");
                        }
                    }
                    return;
                }
            }
            if(cal.find(".next").hasClass("disabled")){
                return;
            }
            if (cal.hasClass('left')) {
                this.leftCalendar.month.add(1, 'month');
            } else {
                this.rightCalendar.month.add(1, 'month');
                if (this.linkedCalendars){
                    this.leftCalendar.month.add(1, 'month');
                }
            }
            this.updateCalendars();
        },

        showChipOptions: function(e){
            if(this.showChips){
                var cal = $(e.target).parents('.calendar');
                cal.find("ul.yearselectContainer").removeClass("open");
                if(cal.find("ul.yearselectContainer li.selected").length > 0){
                    var yrSec = cal.find("ul.yearselectContainer li.selected").closest("ul");
                    var index = cal.find("ul.yearselectContainer").index(yrSec);
                    cal.find(".prev,.next").removeClass("disabled");
                    if(index == 0){
                        cal.find(".prev").addClass("disabled");
                    }
                    if(index == cal.find("ul.yearselectContainer").length-1){
                        cal.find(".next").addClass("disabled");
                    }
                    yrSec.toggleClass("open");
                }else{
                    cal.find("ul.yearselectContainer:eq(0)").toggleClass("open");
                    cal.find(".prev").addClass("disabled");
                }
            }
        },

        chipMonthSelect: function(e){
            if(this.showChips){
                var cal = $(e.target).parents('.calendar');
                var value = $(e.target).attr("value");
                var monthSelect = cal.find(".chip-select.monthselect");
                $(monthSelect).val(value);
                $(monthSelect).trigger('change')
            }
        },

        chipYearSelect: function(e){
            if(this.showChips){
                var cal = $(e.target).parents('.calendar');
                var value = $(e.target).attr("value");
                var yearSelect = cal.find(".chip-select.yearselect");
                $(yearSelect).val(value);
                $(yearSelect).trigger('change');
                cal.find("ul.monthselect").toggleClass("open");
                cal.find(".prev").addClass("disabled");
                cal.find(".next").addClass("disabled");
            }
        },

        hoverDate: function(e) {

            //ignore mouse movements while an above-calendar text input has focus
            //if (this.container.find('input[name=daterangepicker_start]').is(":focus") || this.container.find('input[name=daterangepicker_end]').is(":focus"))
            //    return;

            //ignore dates that can't be selected
            if (!$(e.target).hasClass('available')){ return;}

            //have the text inputs above calendars reflect the date being hovered over
            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');
            var date = cal.hasClass('left') ? this.leftCalendar.calendar[row][col] : this.rightCalendar.calendar[row][col];

            //highlight the dates between the start date and the date being hovered as a potential end date
            var leftCalendar = this.leftCalendar;
            var rightCalendar = this.rightCalendar;
            var startDate = this.startDate;
            if (!this.endDate) {
                this.container.find('.calendar tbody td').each(function(index, el) {

                    //skip week numbers, only look at dates
                    if ($(el).hasClass('week')){return;}

                    var title = $(el).attr('data-title');
                    var row = title.substr(1, 1);
                    var col = title.substr(3, 1);
                    var cal = $(el).parents('.calendar');
                    var dt = cal.hasClass('left') ? leftCalendar.calendar[row][col] : rightCalendar.calendar[row][col];

                    if ((dt.isAfter(startDate) && dt.isBefore(date)) || dt.isSame(date, 'day')) {
                        $(el).addClass('in-range');
                    } else {
                        $(el).removeClass('in-range');
                    }

                });
            }

        },

        clickDate: function(e) {
            if (!$(e.target).hasClass('available')){return;}
            var cal = $(e.target).parents('.calendar');
            var title = $(e.target).attr('data-title');
            var endDate;
            if(this.weekPicker){
                weekends = $(e.target).closest("tr").find(".weekend");
                if(weekends.length > 0){
                    title =  $(weekends[0]).attr('data-title');
                    var endTitle = $(weekends[1]).attr('data-title');
                    var row = endTitle.substr(1, 1);
                    var col = endTitle.substr(3, 1);
                    endDate = cal.hasClass('left') ? this.leftCalendar.calendar[row][col] : this.rightCalendar.calendar[row][col];
                }
            }
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);

            var date = cal.hasClass('left') ? this.leftCalendar.calendar[row][col] : this.rightCalendar.calendar[row][col];
            //
            // this function needs to do a few things:
            // * alternate between selecting a start and end date for the range,
            // * if the time picker is enabled, apply the hour/minute/second from the select boxes to the clicked date
            // * if autoapply is enabled, and an end date was chosen, apply the selection
            // * if single date picker mode, and time picker isn't enabled, apply the selection immediately
            // * if one of the inputs above the calendars was focused, cancel that manual input
            //

            if (this.endDate || date.isBefore(this.startDate, 'day')) { //picking start
                if (this.timePicker) {
                    var hour = parseInt(this.container.find('.left select.hourselect').val(), 10);
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.left select.ampmselect').val();
                        if (ampm === 'PM' && hour < 12){
                            hour += 12;
                        }
                        if (ampm === 'AM' && hour === 12){
                            hour = 0;
                        }
                    }
                    var minute = parseInt(this.container.find('.left select.minuteselect').val(), 10);
                    var second = this.timePickerSeconds ? parseInt(this.container.find('.left select.secondselect').val(), 10) : 0;
                    date = date.clone().hour(hour).minute(minute).second(second);
                }
                this.endDate = null;
                this.setStartDate(date.clone());
                if(this.weekPicker){
                    this.setEndDate(endDate.clone());
                    this.clickApply();
                }
            } else if (!this.endDate && date.isBefore(this.startDate)) {
                //special case: clicking the same date for start/end,
                //but the time of the end date is before the start date
                this.setEndDate(this.startDate.clone());
            } else { // picking end
                if (this.timePicker) {
                    var hour = parseInt(this.container.find('.right select.hourselect').val(), 10);
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.right select.ampmselect').val();
                        if (ampm === 'PM' && hour < 12){
                            hour += 12;
                        }
                        if (ampm === 'AM' && hour === 12){
                            hour = 0;
                        }
                    }
                    var minute = parseInt(this.container.find('.right select.minuteselect').val(), 10);
                    var second = this.timePickerSeconds ? parseInt(this.container.find('.right select.secondselect').val(), 10) : 0;
                    date = date.clone().hour(hour).minute(minute).second(second);
                }
                this.setEndDate(date.clone());
                if (this.autoApply) {
                  this.calculateChosenLabel();
                  this.clickApply();
                }
            }

            if (this.singleDatePicker) {
                this.setEndDate(this.startDate);
                if (!this.timePicker){
                    this.clickApply();
                }
            }

            this.updateView();

            //This is to cancel the blur event handler if the mouse was in one of the inputs
            e.stopPropagation();

        },

        calculateChosenLabel: function () {
            var customRange = true;
            var i = 0;
            for (var range in this.ranges) {
              if (this.timePicker) {
                    var format = this.timePickerSeconds ? "YYYY-MM-DD hh:mm:ss" : "YYYY-MM-DD hh:mm";
                    //ignore times when comparing dates if time picker seconds is not enabled
                    if (this.startDate.format(format) == this.ranges[range][0].format(format) && this.endDate.format(format) == this.ranges[range][1].format(format)) {
                        customRange = false;
                        this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')').addClass('active').attr('data-range-key');
                        break;
                    }
                } else {
                    //ignore times when comparing dates if time picker is not enabled
                    if (this.startDate.format('YYYY-MM-DD') == this.ranges[range][0].format('YYYY-MM-DD') && this.endDate.format('YYYY-MM-DD') == this.ranges[range][1].format('YYYY-MM-DD')) {
                        customRange = false;
                        this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')').addClass('active').attr('data-range-key');
                        break;
                    }
                }
                i++;
            }
            if (customRange) {
                if (this.showCustomRangeLabel) {
                    this.chosenLabel = this.container.find('.ranges li:last').addClass('active').attr('data-range-key');
                } else {
                    this.chosenLabel = null;
                }
                this.showCalendars();
            }
        },

        clickApply: function(e) {
            this.hide();
            this.element.trigger('apply.'+this.basePickerClass, this);
        },

        clickCancel: function(e) {
            this.startDate = this.oldStartDate;
            this.endDate = this.oldEndDate;
            this.hide();
            this.element.trigger('cancel.'+this.basePickerClass, this);
        },

        monthOrYearChanged: function(e) {
            var isLeft = $(e.target).closest('.calendar').hasClass('left'),
                leftOrRight = isLeft ? 'left' : 'right',
                cal = this.container.find('.calendar.'+leftOrRight);

            // Month must be Number for new moment versions
            var month = parseInt(cal.find('.monthselect').val(), 10);
            var year = cal.find('.yearselect').val();

            if (!isLeft) {
                if (year < this.startDate.year() || (year == this.startDate.year() && month < this.startDate.month())) {
                    month = this.startDate.month();
                    year = this.startDate.year();
                }
            }

            if (this.minDate) {
                if (year < this.minDate.year() || (year == this.minDate.year() && month < this.minDate.month())) {
                    month = this.minDate.month();
                    year = this.minDate.year();
                }
            }

            if (this.maxDate) {
                if (year > this.maxDate.year() || (year == this.maxDate.year() && month > this.maxDate.month())) {
                    month = this.maxDate.month();
                    year = this.maxDate.year();
                }
            }

            if (isLeft) {
                this.leftCalendar.month.month(month).year(year);
                if (this.linkedCalendars){
                    this.rightCalendar.month = this.leftCalendar.month.clone().add(1, 'month');
                }
            } else {
                this.rightCalendar.month.month(month).year(year);
                if (this.linkedCalendars){
                    this.leftCalendar.month = this.rightCalendar.month.clone().subtract(1, 'month');
                }
            }
            this.updateCalendars();
        },

        timeChanged: function(e) {

            var cal = $(e.target).closest('.calendar'),
                isLeft = cal.hasClass('left');

            var hour = parseInt(cal.find('select.hourselect').val(), 10);
            var minute = parseInt(cal.find('select.minuteselect').val(), 10);
            var second = this.timePickerSeconds ? parseInt(cal.find('select.secondselect').val(), 10) : 0;

            if (!this.timePicker24Hour) {
                var ampm = cal.find('select.ampmselect').val();
                if (ampm === 'PM' && hour < 12){
                    hour += 12;
                }
                if (ampm === 'AM' && hour === 12){
                    hour = 0;
                }
            }

            if (isLeft) {
                var start = this.startDate.clone();
                start.hour(hour);
                start.minute(minute);
                start.second(second);
                this.setStartDate(start);
                if (this.singleDatePicker) {
                    this.endDate = this.startDate.clone();
                } else if (this.endDate && this.endDate.format('YYYY-MM-DD') == start.format('YYYY-MM-DD') && this.endDate.isBefore(start)) {
                    this.setEndDate(start.clone());
                }
            } else if (this.endDate) {
                var end = this.endDate.clone();
                end.hour(hour);
                end.minute(minute);
                end.second(second);
                this.setEndDate(end);
            }

            //update the calendars so all clickable dates reflect the new time component
            this.updateCalendars();

            //update the form inputs above the calendars with the new time
            this.updateFormInputs();

            //re-render the time pickers because changing one selection can affect what's enabled in another
            this.renderTimePicker('left');
            this.renderTimePicker('right');

        },

        elementChanged: function() {
            if (!this.element.is('input')){return;}
            if (!this.element.val().length){return;}

            var dateString = this.element.val().split(this.locale.separator),
                start = null,
                end = null;

            if (dateString.length === 2) {
                start = moment(dateString[0], this.locale.format);
                end = moment(dateString[1], this.locale.format);
            }

            if (this.singleDatePicker || start === null || end === null) {
                start = moment(this.element.val(), this.locale.format);
                end = start;
            }

            if (!start.isValid() || !end.isValid()){return;}

            this.setStartDate(start);
            this.setEndDate(end);
            this.updateView();
        },

        keydown: function(e) {
            //hide on tab or enter
            if ((e.keyCode === 9) || (e.keyCode === 13)) {
                this.hide();
            }

            //hide on esc and prevent propagation
            if (e.keyCode === 27) {
                e.preventDefault();
                e.stopPropagation();

                this.hide();
            }
        },

        updateElement: function() {
            if (this.element.is('input') && !this.singleDatePicker && this.autoUpdateInput) {
                this.element.val(this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format));
                this.element.trigger('change');
            } else if (this.element.is('input') && this.autoUpdateInput) {
                this.element.val(this.startDate.format(this.locale.format));
                this.element.trigger('change');
            }
        },

        remove: function() {
            this.container.remove();
            this.element.off('.'+this.basePickerClass);
            this.element.removeData();
        }

    };

    $.fn.fwdaterangepicker = function(options, callback) {
        var implementOptions = $.extend(true, {}, $.fn.fwdaterangepicker.defaultOptions, options);
        this.each(function() {
            var el = $(this);
            if (el.data('fwdaterangepicker')){
                el.data('fwdaterangepicker').remove();
            }
            el.data('fwdaterangepicker', new FWDateRangePicker(el, implementOptions, callback));
        });
        return this;
    };

    return FWDateRangePicker;

}));
//ignorei18n_end
