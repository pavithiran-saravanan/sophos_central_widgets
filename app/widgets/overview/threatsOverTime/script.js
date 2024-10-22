const chartData = {
    title: {
        text: '',
        align: 'left'
    },

    exporting: {
        enabled: false 
    },

    credits: {
        enabled: false,
    },

    tooltip: {
        formatter: function() {
            return `Threat Count: ${this.y}`; // Show only the y value
        }
    },

    subtitle: {
        text: '',
        align: 'left'
    },

    yAxis: {
        title: {
            text: 'Count'
        }
    },

    xAxis: {
    	title:{
        	text: 'Time'
        },
        type: 'datetime',  // Set the x-axis to handle time
        tickInterval: 3600 * 1000,  // 1-hour intervals
        labels: {
            format: '{value:%H:%M}',  // Format time as HH:MM
        },
        min: (new Date()).getTime() - 24 * 3600 * 1000,  // Set range to the last 24 hours
        max: (new Date()).getTime()  // Set the max to current time
    },

legend: {
				enabled: false
    },

    plotOptions: {
        series: {
            label: {
                connectorAllowed: false
            },
        }
    },

    series: [
        {
            color: '#FF0000',
            data: [
                6, 0, 103, 50, 31, 80,
            ]
        }, 
    ],

    responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    }

};

function getHourBucket(isoString) {
    const [datePart, timePart] = isoString.split('T');
    const [year, month, day] = datePart.split('-');
    const [hour] = timePart.split(':'); // Get the hour, ignore minutes and seconds
    return new Date(Date.UTC(year, month - 1, day, hour)).getTime();
}

async function setData(params) {
    // Get events reponse
    const data = await fetch("/events").then(
        async (res) => await res.json()
    );
    const events = data.items;
    console.log(events);

    // Parse data
    let hourlyCounter = {};
    events.forEach((event)=>{
        if(event.threat){
            const bucketName = getHourBucket(event.when);
            if(!hourlyCounter[bucketName]) hourlyCounter[bucketName] = 1;
            else hourlyCounter[bucketName]++;
        }
    })
    const hourlyChartData = Object.entries(hourlyCounter).map(([key, value]) => [Number(key), value]);
    console.log(hourlyChartData);

    // Update chartData
    chartData.series[0].data = hourlyChartData;

    // Render chart
    Highcharts.chart('threatsOverTime', chartData);
}

document.addEventListener("DOMContentLoaded", async () => {
    console.log("data loading...");
    setData();
});