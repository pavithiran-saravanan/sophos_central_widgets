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
        const actionItem = createElement('li', '', action);
        dropdownMenu.appendChild(actionItem);
    });
    dropdownWrapper.appendChild(dropdownMenu);

    // Event to toggle dropdown visibility
    actionsButton.addEventListener('click', function() {
        dropdownMenu.classList.toggle('show');
    });

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
function createDetectionWidget() {
    const detectionContainer = createElement('div', 'detection-container hide');
    
    // Create and append tab header
    const tabList = createElement('ul', 'tab-list');
    const tabs = [
        { name: 'Detection', data: detectionDetailsData, showActions: true },
        { name: 'Mitre', data: mitreDetailsData, showActions: false },
        { name: 'Geolocation', data: geolocationDetailsData, showActions: false },
        { name: 'IntelixFileReputation', data: intelixFileReputationData, showActions: false }
    ];
    tabs.forEach(tab => {
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

function createDetectionContainer(){
    // Create Item Container
    const detectionItem = document.createElement('div');
    detectionItem.classList.add('detectionItem');

    // Create title details container
    const titleDetailsContainer = document.createElement('div');
    titleDetailsContainer.classList.add('titleDetailsContainer');

    // Get titleElement
    const titleElement = getTitleComponent(detectionDetailsData["Detection Attack"], detectionDetailsData["Detection Name"]);

    // Add elements to titleDetailsContainer
    titleDetailsContainer.append(titleElement, createDetectionWidget());

    // Add elements to container
    detectionItem.append(getDateTimeComponent(), titleDetailsContainer);

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
for(let i = 0; i < 5; i++){
    createDetectionContainer();
}