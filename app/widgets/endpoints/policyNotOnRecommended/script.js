async function setData() {
    try {
        const response = await fetch("/scores");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const policy = data.endpoint.policy;
    
        Highcharts.chart('policyNotOnRecommended', {
            chart: {
                type: 'column'
            },
            title: { text: undefined },
            xAxis: {
                categories: ['Not On Recommended'],
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Count'
                },
                allowDecimals: false,
            },
            colors: ['#236484', '#2B8AB9'],
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
                name: 'Computer',
                data: [policy.computer['threat-protection'].notOnRecommended]
            },{
                name: 'Server',
                data: [policy.server['server-threat-protection'].notOnRecommended]
            }]
        });
    } catch (error) {
        console.error('Error fetching policy not on recommended data:', error);
        document.getElementById('policyNotOnRecommended').innerHTML = 
            '<p>Error loading policy not on recommended data. Please try again later.</p>';
    }
}

document.addEventListener('DOMContentLoaded', setData);
