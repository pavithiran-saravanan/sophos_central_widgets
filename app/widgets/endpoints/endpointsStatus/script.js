const pieChart = {
    chart: {
        type: 'pie',
        custom: {},
        events: {
            render() {
                const chart = this;
                const series = chart.series[0];
                let total = 0;
                for (var i = 0, len = this.series[0].yData.length; i < len; i++) {
                    total += this.series[0].yData[i];
                }
                let customLabel = chart.options.chart.custom.label = chart.renderer
                    .label(
                        '<div style="text-align: center;"><p style="font-size: 1.6em; margin: 0;"><strong>'+total+'</strong></p></br><small style="font-size: 0.8em; color: #888;">Total</small></div>'
                    )
                    .css({
                        color: '#000',
                        textAnchor: 'middle',
                    })
                    .add();

                const x = series.center[0] + chart.plotLeft;
                const y = series.center[1] + chart.plotTop - customLabel.attr('height') / 2;

                customLabel.attr({ x, y });
                // Set font size based on chart diameter
                customLabel.css({
                    fontSize: `${series.center[2] / 12}px`,
                });
            }
        },
    },
    title: {
        text: undefined
    },
    legend: {
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical'
    },
    plotOptions: {
        series: {
            allowPointSelect: true,
            cursor: 'pointer',
            borderRadius: 0,
            dataLabels: [{
                enabled: false,
            }, {
                enabled: false
            }],
            point:{
                events:{
                    click(event){
                        console.log('e ', event);
                    }
                }
            },
            showInLegend: true
        }
    },
    series: [{
        name: 'Endpoint Status',
        colorByPoint: true,
        innerSize: '60%',
        colors: ['#E57E4D', '#E54C4C'],
    }]
}

async function setData() {
    console.log('fetching data...');
    const data = await fetch("/endpoints").then(res => res.json())
    console.log('data ', data);

    let isolated = 0;
    let unisolated = 0;

    for (let item of data.items) {
        if(item.isolation.status === 'isolated') {
            isolated++;
        } else {
            unisolated++;
        }   
    }

    pieChart.series[0].data = [
        {
            name: 'Isolated',
            y: isolated
        },
        {
            name: 'Non Isolated',
            y: unisolated
        }
    ];

    Highcharts.chart('endpointsStatusChart', pieChart);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('data loading...');
    setData();
});