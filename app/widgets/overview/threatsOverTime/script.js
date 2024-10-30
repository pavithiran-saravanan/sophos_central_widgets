const chartData = {
    chart: {
        type: 'line',
    },

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
            return 'Time: ' + new Date(this.x).toUTCString() + '<br>' +  'Threats: ' + this.y;
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
        tickInterval: 3600000,
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
    // return new Date(isoString).getTime();
    const [datePart, timePart] = isoString.split('T');
    const [year, month, day] = datePart.split('-');
    const [hour, minute, second] = timePart.split(':'); // Get the hour & minute. Ignore seconds
    return Date.UTC(year, month - 1, day, hour, minute);
}

async function setData(params) {
    // Get events reponse
    const data = await fetch("/events").then(
        async (res) => await res.json()
    );
    console.log(data);
    const events = data.items;

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