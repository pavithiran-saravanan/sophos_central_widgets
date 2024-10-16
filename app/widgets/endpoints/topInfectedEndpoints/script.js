async function setData() {
    try {
        const response = await fetch("/detections/run");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        let data = await response.json();
        let result = {};
        do{
            const response = await fetch("/detections/status?queryId=" + data.id);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            data = await response.json();
            if (data.status === 'finished') {
                const response = await fetch("/detections/results?queryId=" + data.id);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data2 = await response.json();
                result = data2.items.reduce((acc, item) => {
                    if(acc[item.device.id]){
                        acc[item.device.id] = {...acc[item.device.id], detections: acc[item.device.id].detections + 1};
                    } else {
                        acc[item.device.id] = {
                            name: item.device.entity,
                            detections: 1,
                            os: item.rawData.meta_os_platform,
                            location: item.geolocation[0].country,
                        };
                    }
                    return acc;
                }, {});
            }
        } while(data.status !== 'finished')

        const container = document.getElementById('topInfectedEndpoints');
        const table = document.createElement('table');
        const headerRow = document.createElement('tr');
        const headers = ['Endpoint', 'Detections', 'OS', 'Location'];
        headers.forEach(headerText => {
            const header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });
        table.appendChild(headerRow);

        Object.values(result).forEach(endpoint => {
            const row = document.createElement('tr');
            for (let key in endpoint) {
                const cell = document.createElement('td');
                if(key === 'detections'){
                    const link = document.createElement('a');
                    link.textContent = endpoint[key];
                    cell.appendChild(link);
                } else {
                    cell.textContent = endpoint[key];
                }
                row.appendChild(cell);
            }
            table.appendChild(row);
        });

        container.appendChild(table);


    } catch (error) {
        console.error('Error fetching top infected endpoints data:', error);
        document.getElementById('topInfectedEndpoints').innerHTML = 
            '<p>Error loading top infected endpoints data. Please try again later.</p>';
    }
}

document.addEventListener('DOMContentLoaded', setData);