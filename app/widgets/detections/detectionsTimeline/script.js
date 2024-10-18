// Dummy data for detection timeline
const detections = [
    {
        time: "10:17:05",
        date: "2019-07-08",
        event: "HTTP traffic from asset DEV01-39X-1 matched IDS signature for threat CVE-2021-44228 Exploit",
        details: "Device Entity: DEV01-39X-1\nDetection Name: CVE-2021-44228 Exploit\nSeverity: Critical",
        detection: {
            deviceId: "6f56511d-f3f9-4c39-9b7b-113cc6a638fd",
            deviceType: "computer",
            deviceEntity: "subash-17785",
            detectionName: "Security Event Service Detections",
            detectionRule: "WIN-PROT-BEHAVIORAL-MALWARE-DISRUPT-2A-T1574-002",
            detectionAttack: "Defense Evasion",
        },
        mitre:[
            {
                "tactic": {
                    "id": "TA0005",
                    "name": "Defense Evasion",
                    "techniques": [
                        {
                            "id": "T1574.002",
                            "name": "DLL Side-Loading"
                        }
                    ]
                }
            }
        ],
        geoLocation:[
            {
                city: "Bengaluru",
                country: "India",
                countryCode: "IN",
                fieldName: "raw.meta_public_ip",
                fieldValue: "152.58.246.237",
                latitude: 12.9634,
                longitude: 77.5855,
                postal: "560002",
                state: "Karnataka",
            }
        ],
        intelixFileReputation:[
            {
                fieldName: "raw.process_sha256",
                fieldValue: "9097abe1330f8e438c3f0d78ca677454f4191506c342bebaa19665787c7c8df7",
                reputationScore: 54
            }
        ]
    },
];
const actions = ["Isolate", "Delete", "Scan", "Update Adaptive Attack Protection"];

// Function to render the timeline
function renderTimeline() {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = ''; // Clear previous content

    detections.forEach(detection => {
        const item = document.createElement('div');
        item.classList.add('timeline-item');

        item.innerHTML = `
            <div class="time">${detection.time}</div>
            <div class="event">${detection.event}</div>
            <div class="details">${detection.details}</div>
            <div class="actions">${detection.actions.map(action => `<button>${action}</button>`).join('')}</div>
        `;

        item.querySelector('.event').addEventListener('click', () => {
            const details = item.querySelector('.details');
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
        });

        timeline.appendChild(item);
    });
}

// Initialize
// renderTimeline();

// Helper function to obtain severity class for severity number
function getSeverityClass(severity){
    if(severity > 10) return "critical";
    if(severity >= 8) return "high";
    if(severity >= 4) return "medium";
    if(severity >= 1) return "low";
    else return "info";
}

// DateTime Component
function getDateTimeComponent(date='2024-09-18', time='10:17:05'){
    const dateTimeContainer = document.createElement('div');
    dateTimeContainer.classList.add('dateTimeContainer');

    const timeElement = document.createElement('div');
    timeElement.classList.add('detectionTime');
    timeElement.innerText = time;

    const dateElement = document.createElement('div');
    dateElement.classList.add('detectionDate');
    dateElement.innerText = date;

    dateTimeContainer.append(timeElement, dateElement);
    return dateTimeContainer;
}

// TitleDescription Component
function getTitleComponent(title, description, severity="high"){
    const titleContainer = document.createElement('div');
    titleContainer.classList.add('titleContainer', severity);

    const titleElement = document.createElement('div');
    titleElement.classList.add('detectionTitle');
    titleElement.innerText = title;

    const descriptionElement = document.createElement('div');
    descriptionElement.classList.add('detectionDescription');
    descriptionElement.innerText = description;

    titleContainer.append(titleElement, descriptionElement);
    return titleContainer;
}

// Detection Details Component
const detectionDetailsData = {
    "Device Entity": "EC2AMAZ-HKOG4LG",
    "Detection Name": "WIN-EXE-DM-SUS-POWERSHELL-SCRIPT-BLOCK-1",
    "Detection Rule": "WIN-PER-PSH-ADD-SERVICE-REG-1",
    "Detection Attack": "Defense Evasion",
    "Device Id": "0569f2b7-756c-4d16-8804-798a6d0030cf",
    "Device Type": "sensor"
};

const mitreDetailsData = {
    "Technique": "T1059.001 - PowerShell",
    "Tactic": "Execution",
    "Procedure": "Obfuscated PowerShell Commands"
};

const geolocationDetailsData = {
    "Country": "United States",
    "City": "Los Angeles",
    "Latitude": "34.0522",
    "Longitude": "-118.2437"
};

const intelixFileReputationData = {
    "File Name": "malicious.exe",
    "File Hash": "abc123def456gh7890",
    "Reputation": "Malicious",
    "Detected By": "IntelliX Scanner"
};

// Function to create a new element with attributes
function createElement(tag, className = '', textContent = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
}

// Function to construct the details section based on data provided
function createDetailsSection(data, showActions) {
    const content = createElement('div', 'details-content');
    
    Object.keys(data).forEach(key => {
        const item = createElement('div', 'details-item');
        const label = createElement('span', 'details-label', key + ': ');
        const value = createElement('span', '', data[key]);
        item.appendChild(label);
        item.appendChild(value);
        
        // Add actions dropdown only beside the Device Entity in Detection tab
        if (showActions && key === "Device Entity") {
            item.appendChild(createActionsDropdown(actions));
        }

        content.appendChild(item);
    });

    return content;
}

// Function to construct the Actions dropdown menu
function createActionsDropdown(actions) {
    const dropdownWrapper = createElement('div', 'actions-dropdown');
    
    // Button for dropdown
    const actionsButton = createElement('button', 'actions-button', 'Actions ▼');
    dropdownWrapper.appendChild(actionsButton);

    // Dropdown menu
    const dropdownMenu = createElement('ul', 'dropdown-menu');
    actions.forEach(action => {
        const actionItem = createElement('li', action.split(' ')[0], action);
        dropdownMenu.appendChild(actionItem);
    });
    dropdownWrapper.appendChild(dropdownMenu);

    // Event to toggle dropdown visibility
    actionsButton.addEventListener('click', function() {
        dropdownMenu.classList.toggle('show');
    });

    // Handle dropdown item selection
    dropdownMenu.addEventListener('click', (event)=>{
        // Record selection
        const clickedListItem = event.target;

        // Trigger action
        console.log(clickedListItem.className + " event triggered");

        // Close the menu
        dropdownMenu.classList.remove('show');
    })

    // Hide dropdown if clicked outside
    document.addEventListener('click', function(event) {
        if (!dropdownWrapper.contains(event.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    return dropdownWrapper;
}

// Function to handle tab switching
function switchTab(tabList, data, showActions) {
    const detectionContainer = tabList.parentElement;
    const contentArea = detectionContainer.querySelector('.details-content-area');
    contentArea.innerHTML = ''; // Clear previous content
    contentArea.appendChild(createDetailsSection(data, showActions)); // Insert new content
}

// Function to create and append the entire component
function createDetectionWidget(detectionTabData, mitreTabData, geoTabData, intelixTabData) {
    const detectionContainer = createElement('div', 'detection-container hide');
    
    // Create and append tab header
    const tabList = createElement('ul', 'tab-list');
    const tabs = [
        { name: 'Detection', data: detectionTabData, showActions: true },
        { name: 'Mitre', data: mitreTabData, showActions: false },
        { name: 'Geolocation', data: geoTabData, showActions: false },
        { name: 'IntelixFileReputation', data: intelixTabData, showActions: false }
    ];
    tabs.forEach(tab => {
        if(!tab.data)return;
        if(Object.keys(tab.data).length === 0) return;
        const tabElement = createElement('li', 'tab', tab.name);
        if (tab.name === 'Detection') tabElement.classList.add('active'); // Highlight active tab initially
        tabElement.addEventListener('click', function() {
            // When a tab is clicked, remove active class from all the other tabs in the tab group
            tabList.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            tabElement.classList.add('active');
            switchTab(tabList, tab.data, tab.showActions);
        });
        tabList.appendChild(tabElement);
    });
    detectionContainer.appendChild(tabList);

    // Create content area for details
    const contentArea = createElement('div', 'details-content-area');
    contentArea.appendChild(createDetailsSection(detectionDetailsData, true)); // Default content: Detection tab with actions
    detectionContainer.appendChild(contentArea);

    // Append the detectionContainer to the DOM
    // document.body.appendChild(detectionContainer);
    return detectionContainer;
}

// Call the function to build and append the widget
createDetectionWidget();

function createDetectionContainer(date, time, title, desc, severity, detectionData, mitreData, geoData, inteliData){
    // Create Item Container
    const detectionItem = document.createElement('div');
    detectionItem.classList.add('detectionItem');

    // Create title details container
    const titleDetailsContainer = document.createElement('div');
    titleDetailsContainer.classList.add('titleDetailsContainer');

    // Get titleElement
    const titleElement = getTitleComponent(title, desc, severity);

    // Add elements to titleDetailsContainer
    titleDetailsContainer.append(titleElement, createDetectionWidget(detectionData, mitreData, geoData, inteliData));

    // Add elements to container
    detectionItem.append(getDateTimeComponent(date, time), titleDetailsContainer);

    // Add to dom
    document.querySelector('#timeline').append(detectionItem, getGapElement());

    // Hide and show Item details
    detectionItem.querySelector('.titleContainer').addEventListener('click', () => {
        const details = detectionItem.querySelector('.detection-container');
        details.classList.toggle('hide')
    });
}

function getGapElement(){
    const gapline = document.createElement('div');
    gapline.textContent = ""
    gapline.classList.add('gapline');
    return gapline;
}

// Populate timeline with n number of detection items
// for(let i = 0; i < 5; i++){
//     createDetectionContainer();
// }

function camelCaseToCapitalizedSpace(obj) {
    const newObj = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const spacedKey = key.replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
            newObj[spacedKey] = obj[key];
        }
    }
    return newObj;
}

async function setData(params) {
    console.log("fetching data...");
    const data = await fetch("/detections").then(
      async (res) => await res.json()
    );
    console.log(data);
    const detectionsList = data.items;

    detectionsList.forEach((detection)=>{
        // Get date time -> Construct date time component
        const dateTimeSplit = detection.time.split('T');
        const date = dateTimeSplit[0];
        const time = dateTimeSplit[1].split('.')[0];

        // Get title description -> Construct title description component
        const title = detection.attackType;
        const description = detection.detectionRule;
        const severity = getSeverityClass(detection.severity);

        // detectionTabData
        let detectionTabData = {
            "Device Entity": detection.device.entity,
            "Detection Name": detection.attackType,
            "Detection Rule": detection.detectionRule,
            "Detection Attack": detection.detectionAttack,
            "Device Id": detection.device.id,
            "Device Type": detection.device.type
        };
        // mitreTabData
        let mitreTabData = {};
        if(detection.mitreAttacks && detection.mitreAttacks.length > 0){
            mitreTabData = camelCaseToCapitalizedSpace(detection.mitreAttacks[0]);
            console.log(mitreTabData)
        }

        // geolocationTabData - detection.geolocation[0] has an object which has to be converted to object
        const geolocationTabData = camelCaseToCapitalizedSpace(detection.geolocation[0]);

        // intelixFileReputationTabData
        let intelixTabData = {};
        if(detection.intelixFileReputation){
            intelixTabData = camelCaseToCapitalizedSpace(detection.intelixFileReputation[0]);
        }

        createDetectionContainer(date, time, title, description, severity, detectionTabData, mitreTabData, geolocationTabData, intelixTabData);
    })
}

setData();