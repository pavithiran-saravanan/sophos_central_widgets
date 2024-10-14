async function setData() {
    try {
        const response = await fetch("/scores");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const tamperProtection = data.endpoint.tamperProtection;
    
        Highcharts.chart('tamperProtectionStatus', {
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
                    text: 'Score'
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
                name: 'Enabled',
                data: [tamperProtection.computer.total - tamperProtection.computer.disabled, tamperProtection.server.total - tamperProtection.server.disabled]
            },{
                name: 'Disabled',
                data: [tamperProtection.computer.disabled, tamperProtection.server.disabled]
            }]
        });
    } catch (error) {
        console.error('Error fetching tamper protection status data:', error);
        document.getElementById('tamperProtectionStatus').innerHTML = 
            '<p>Error loading tamper protection status data. Please try again later.</p>';
    }
}

document.addEventListener('DOMContentLoaded', setData);
