async function setData() {
    try {
        const response = await fetch("/scores");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const protection = data.endpoint.protection;
    
        Highcharts.chart('endpointsProtectionStatus', {
            chart: {
                type: 'column'
            },
            title: { text: undefined },
            xAxis: {
                categories: ['Computer', 'Server'],
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Count'
                },
                allowDecimals: false,
            },
            colors: ['#7FBC4F', '#DD3F3E'],
            plotOptions: {
                series: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    borderRadius: 0,
                    dataLabels: [{ enabled: false }, { enabled: false }],
                    point: {
                        events: {
                            click: (event) => {
                                console.log('Clicked point:', event)
                                return false
                            }
                        }
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: 'Fully Protected',
                data: [protection.computer.total - protection.computer.notFullyProtected, protection.server.total - protection.server.notFullyProtected]
            },{
                name: 'Not Fully Protected',
                data: [protection.computer.notFullyProtected, protection.server.notFullyProtected]
            }]
        });
    } catch (error) {
        console.error('Error fetching endpoints protection status data:', error);
        document.getElementById('endpointsProtectionStatus').innerHTML = 
            '<p>Error loading endpoints protection status data. Please try again later.</p>';
    }
}

document.addEventListener('DOMContentLoaded', setData);
