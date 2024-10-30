const actions = ["Isolate", "Delete", "Scan", "Update Adaptive Attack Protection"];
const detectionsData = [];
const detectionFilters = {
    "Attack": null,
    "Tactic Name": null, 
    "Severity": null,
    "Type": null,
    "File Name": null
};

function getLoadingElement(){
    const loadingElement = createElement('div', 'loadingElement');
    const loaderIcon = createElement('img', 'loaderIcon');
    loaderIcon.setAttribute('src', '/app/images/spinner_solid_icon.png');
    loadingElement.append(loaderIcon, createElement('spin', '', 'Loading...'));
    return loadingElement;
}

function createAppliedFilterElement(filter, value){
    const appliedFilter = createElement('div', 'appliedFilter', `${filter}: ${value}`);
    const deleteAppliedFilter = createElement('button', 'deleteAppliedFilterButton', 'x');
    deleteAppliedFilter.addEventListener('click', (e)=>{
        detectionFilters[filter] = null;
        displayFilters();
        filterDetectionItems();
    })
    appliedFilter.appendChild(deleteAppliedFilter);
    return appliedFilter;
}

function displayFilters(){
    const appliedFilters = document.querySelector('.appliedFilters');
    appliedFilters.innerHTML = "";
    let appliedFilterCount = 0;
    Object.keys(detectionFilters).forEach(key=>{
        if(detectionFilters[key] !== null && typeof detectionFilters[key] === "string"){
            appliedFilters.appendChild(createAppliedFilterElement(key, detectionFilters[key]));
            appliedFilterCount++;
        }
    });
    if(appliedFilterCount > 0){
        appliedFilters.parentElement.querySelector('.clearFiltersButton').classList.remove('hide');
    }
    else{
        appliedFilters.parentElement.querySelector('.clearFiltersButton').classList.add('hide');
    }
}

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

    const dropdownIcon = createElement("img", "dropdownIcon");
    dropdownIcon.setAttribute("src", "/app/images/arrow_icon.svg");

    titleContainer.append(titleElement, descriptionElement, dropdownIcon);
    return titleContainer;
}

// Function to create a new element with attributes
function createElement(tag, className = '', textContent = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
}

function createBlockActionButton(blockActionParams){
    const blockButton = createElement('button', 'actions-button block-button', 'Block');
    const loadingElement = getLoadingElement();
    blockButton.appendChild(loadingElement);
    blockButton.addEventListener('click', (e)=>{
        // Todo: Show loading icon
        blockButton.classList.add('loading');
        fetch(`/blockItem/${blockActionParams.fileName}/${blockActionParams.path}/${blockActionParams.sha256}`)
        .then(async (response)=>{
            const data = await response.json();
            console.log("Block Item: ", data);
            blockButton.classList.remove('loading');
            if(response.ok){
                if(data.response === "success"){
                    displayBanner("Item Blocked Successfully");
                }
                else if(data.error){
                    displayBanner(data.message, "error");
                }
                else{
                    displayBanner("Error", "error");
                }
            }
            else{
                displayBanner("Error", "error");
            }
        })
    })
    return blockButton;
}

// Function to construct the details section based on data provided
function createDetailsSection(data, showActions, showBlock, blockActionParams) {
    const content = createElement('div', 'details-content');
    
    Object.keys(data).forEach(key => {
        const item = createElement('div', 'details-item');
        const label = createElement('span', 'details-label', key + ': ');
        const value = createElement('span', '', data[key]);
        item.appendChild(label);
        item.appendChild(value);
        
        // Add actions dropdown only beside the Device Entity in Detection tab
        if (showActions && key === "Device Entity") {
            item.appendChild(createActionsDropdown(data["Device Id"]));
        }

        if (showBlock && key === "sha256") {
            item.appendChild(createBlockActionButton(blockActionParams));
        }

        content.appendChild(item);
    });

    return content;
}

// Function to construct the Actions dropdown menu
function createActionsDropdown(deviceId) {
    const dropdownWrapper = createElement('div', 'actions-dropdown');
    
    // Button for dropdown
    const actionsButton = createElement('button', 'actions-button', "Actions");
    const dropDownIcon = createElement('img', 'actionsDropdownIcon');
    dropDownIcon.setAttribute("src", "/app/images/arrow_icon_solid.svg");
    actionsButton.appendChild(dropDownIcon);
    // Add loading element
    actionsButton.appendChild(getLoadingElement());
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
        const clickedListItem = event.target;

        // Isolate
        if(clickedListItem.classList.contains("Isolate")){
            actionsButton.classList.add('loading');
            isolateEndpoint(deviceId).then(()=>{
                actionsButton.classList.remove('loading')
            });
        }

        // Delete
        if(clickedListItem.classList.contains("Delete")){
            actionsButton.classList.add('loading');
            deleteEndpoint(deviceId).then(()=>{
                actionsButton.classList.remove('loading')
            });
        }

        // Scan
        if(clickedListItem.classList.contains("Scan")){
            actionsButton.classList.add('loading');
            scanEndpoint(deviceId).then(()=>{
                actionsButton.classList.remove('loading')
            });
        }

        // AAP
        if(clickedListItem.classList.contains("Update")){
            actionsButton.classList.add('loading');
            updateAAP(deviceId).then(()=>{
                actionsButton.classList.remove('loading')
            });
        }

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
function switchTab(tabList, data, showActions, showBlock, blockActionParams) {
    const detectionContainer = tabList.parentElement;
    const contentArea = detectionContainer.querySelector('.details-content-area');
    contentArea.innerHTML = ''; // Clear previous content
    contentArea.appendChild(createDetailsSection(data, showActions, showBlock, blockActionParams)); // Insert new content
    // If Intelix tab, show reputation score widget
    if(data["Reputation Score"]){
        contentArea.appendChild(getIntelixReputationWidget(data["Reputation Score"]));
    }
}

// Function to create and append the entire component
function createDetectionWidget(detectionTabData, mitreTabData, geoTabData, intelixTabData, blockActionParams) {
    const detectionContainer = createElement('div', 'detection-container hide');
    
    // Create and append tab header
    const tabList = createElement('ul', 'tab-list');
    const tabs = [
        { name: 'Detection', data: detectionTabData, showActions: true },
        { name: 'Mitre', data: mitreTabData, showActions: false },
        { name: 'Geolocation', data: geoTabData, showActions: false },
        { name: 'IntelixFileReputation', data: intelixTabData, showActions: false, showBlock: true }
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
            switchTab(tabList, tab.data, tab.showActions, tab.showBlock, blockActionParams);
        });
        tabList.appendChild(tabElement);
    });
    detectionContainer.appendChild(tabList);

    // Create content area for details
    const contentArea = createElement('div', 'details-content-area');
    contentArea.appendChild(createDetailsSection(detectionTabData, true)); // Default content: Detection tab with actions
    detectionContainer.appendChild(contentArea);

    // Append the detectionContainer to the DOM
    // document.body.appendChild(detectionContainer);
    return detectionContainer;
}

function createDetectionContainer(date, time, title, desc, severity, detectionData, mitreData, geoData, inteliData, blockActionParams){
    // Create Item Container
    const detectionItem = document.createElement('div');
    detectionItem.classList.add('detectionItem');

    // Create title details container
    const titleDetailsContainer = document.createElement('div');
    titleDetailsContainer.classList.add('titleDetailsContainer');

    // Get titleElement
    const titleElement = getTitleComponent(title, desc, severity);

    // Add elements to titleDetailsContainer
    titleDetailsContainer.append(titleElement, createDetectionWidget(detectionData, mitreData, geoData, inteliData, blockActionParams));

    // Add elements to container
    detectionItem.append(getDateTimeComponent(date, time), titleDetailsContainer);

    // Add to dom
    document.querySelector('#timeline').append(detectionItem, getGapElement());

    // Hide and show Item details
    detectionItem.querySelector('.titleContainer').addEventListener('click', (e) => {
        detectionItem.classList.toggle('open');
        const details = detectionItem.querySelector('.detection-container');
        details.classList.toggle('hide');
    });
}

function getGapElement(){
    const gapline = document.createElement('div');
    gapline.textContent = ""
    gapline.classList.add('gapline');
    return gapline;
}

async function setData(params) {
    console.log("fetching data...");
    const data = await fetch("/detections").then(
      async (res) => await res.json()
    );
    console.log(data);
    const detectionsList = data.items;
    let detectionsWithIntelix = [];

    detectionsList.forEach((detection)=>{
        // Get data for dateTimeComponent
        const dateTimeSplit = detection.time.split('T');
        const date = dateTimeSplit[0];
        const time = dateTimeSplit[1].split('.')[0];

        // Get data for titleComponent
        const title = detection.attackType;
        const description = detection.detectionRule;
        const severity = getSeverityClass(detection.severity);

        // Get data for tabs
        const detectionTabData = {
            "Device Entity": detection.device.entity,
            "Detection Name": detection.attackType,
            "Detection Rule": detection.detectionRule,
            "Detection Attack": detection.detectionAttack,
            "Device Id": detection.device.id,
            "Device Type": detection.device.type
        };
        const geolocationTabData = {
            "Public IP": detection.geolocation[0].fieldValue,
            "City": detection.geolocation[0].city,
            "State": detection.geolocation[0].state,
            "Country": detection.geolocation[0].country,
            "Country Code": detection.geolocation[0].countryCode,
            "Postal": detection.geolocation[0].postal,
            "Latitude": detection.geolocation[0].latitude,
            "Longitude": detection.geolocation[0].longitude,
        }
        let mitreTabData = {};
        if(detection.mitreAttacks && detection.mitreAttacks.length > 0){
            mitreTabData = {
                "Tactic Id": detection.mitreAttacks[0].tactic.id,
                "Tactic Name": detection.mitreAttacks[0].tactic.name,
                "Technique Id": detection.mitreAttacks[0].tactic.techniques[0].id,
                "Technique Name": detection.mitreAttacks[0].tactic.techniques[0].name,
            }
        }
        let intelixTabData = {};
        let blockActionParams = {};
        if(detection.intelixFileReputation){
            detectionsWithIntelix.push(detection);
            intelixTabData = {
                "sha256": detection.intelixFileReputation[0].fieldValue,
                "Reputation Score": detection.intelixFileReputation[0].reputationScore,
            }
            blockActionParams = {
                "fileName": detection.rawData.process_name,
                "path": detection.rawData.process_sha256,
                "sha256": detection.rawData.process_sha256
            }
        }
        detectionsData.push({date, time, title, description, severity, detectionTabData, mitreTabData, geolocationTabData, intelixTabData, blockActionParams});
    })
    displayDetectionItems();
}

function getIntelixReputationWidget(score){
    const reputationScoreWidget = createElement("div", "reputationScoreWidget");
    const scorePointerContainer = createElement("div", "scorePointerContainer");
    const scorePointer = createElement("div", "scorePointer");
    const scoreBar = createElement("div", "scoreBar");
    const scoreText = createElement("div", "scoreText");
    const scoreValue = createElement("span", "scoreValue", score);

    // Score Pointer Container
    scorePointerContainer.append(scorePointer);
    scorePointer.style.left = 12 + (score / 100) * 76 + '%';

    // Score Bar
    for(let i = 0; i < 5; i++){
        scoreBar.appendChild(createElement("span"));
    }

    // Score Text
    scoreText.textContent = "Reputation Score = ";
    scoreText.append(scoreValue);

    reputationScoreWidget.append(scorePointerContainer, scoreBar, scoreText);
    return reputationScoreWidget;
}

function displayBanner(message, type = "success") {
    const banner = createElement("div", "banner");

    // Close Alert Button
    const closeAlert = createElement("div", "closeAlertBanner");
    closeAlert.innerHTML = "✕";
    closeAlert.addEventListener("click", ()=>banner.remove());

    if (type === "success") {
      banner.classList.add("success-banner");
      const successIcon = createElement("img", "successIcon bannerIcon");
      successIcon.setAttribute("src", "/app/images/success_icon.svg");
      banner.appendChild(successIcon);
    } else if (type === "error") {
      banner.classList.add("error-banner");
      const errorIcon = createElement("img", "errorIcon bannerIcon");
      errorIcon.setAttribute("src", "/app/images/error_icon.svg");
      banner.appendChild(errorIcon);
    }
    banner.appendChild(createElement("span", "", message));
    document.querySelector(".alertBannerContainer").appendChild(banner);
    banner.appendChild(closeAlert);
    setTimeout(() => {
      banner.remove();
    }, 3000);
}

function displayDetectionItems(data = detectionsData){
    const timeline = document.querySelector('#timeline');
    timeline.innerHTML = '';
    console.log("Filtered Data: ", data);
    data.forEach(({date, time, title, description, severity, detectionTabData, mitreTabData, geolocationTabData, intelixTabData, blockActionParams})=>{
        createDetectionContainer(date, time, title, description, severity, detectionTabData, mitreTabData, geolocationTabData, intelixTabData, blockActionParams);
    })
}

function filterDetectionItems(){
    // Go through each filter
    // If a filter is null return true
    // If a filter is not null, then stringmatch
    const applyAttackFilter = function({detectionTabData}){
        if(detectionFilters["Attack"]){
            return detectionTabData["Detection Attack"].toLowerCase().includes(detectionFilters["Attack"].toLowerCase());
        }
        return true;
    }

    const applyTacticNameFilter = function({mitreTabData}){
        if(detectionFilters["Tactic Name"]){
            return mitreTabData["Tactic Name"] ? mitreTabData["Tactic Name"].toLowerCase().includes(detectionFilters["Tactic Name"].toLowerCase()) : false
        }
        return true;
    }

    const applySeverityFilter = function({severity}){
        if(detectionFilters["Severity"]){
            return severity === detectionFilters["Severity"].toLowerCase();
        }
        return true;
    }   

    const applyTypeFilter = function({title}){
        if(detectionFilters["Type"]){
            return title.toLowerCase().includes(detectionFilters["Type"].toLowerCase())
        }
        return true;
    }

    const applyFileNameFilter = function({blockActionParams}){
        if(detectionFilters["File Name"]){
            return blockActionParams["fileName"] ? blockActionParams.fileName.toLowerCase().includes(detectionFilters["File Name"].toLowerCase()) : false
        }
        return true;
    }

    const filteredDetectionsData = detectionsData.filter((data)=>{
        return applyAttackFilter(data) && applyTacticNameFilter(data) && applySeverityFilter(data) && applyTypeFilter(data) && applyFileNameFilter(data);
    })

    displayDetectionItems(filteredDetectionsData);
}
  
// Search Filter Menu 
(function(){
    const filterContainer = document.querySelector('.filterContainer');
    const filterButton = document.querySelector('.filterButton');
    const filterButtonContainer = document.querySelector('.filterButtonContainer');
    const filterMenu = document.querySelector('.filterMenu');
    const filterCategoryDropdown = document.querySelector('.filterCategoryDropdown')
    const applyFilterButton = document.querySelector('.applyFilterButton');
    const cancelFilterButton = document.querySelector('.cancelFilterButton');
    const clearFiltersButton = document.querySelector('.clearFiltersButton');
    const severitySelector = document.querySelector('.severitySelector');
    const searchInputContainer = document.querySelector('.searchInputContainer');
    const searchBar = document.querySelector('.searchBar');

    const hideFilterMenu = function(){
        filterMenu.classList.remove('show');
        filterCategoryDropdown.value = "Attack";
        severitySelector.value = "Info";
        severitySelector.classList.add('hide');
        searchInputContainer.classList.remove('hide');
        searchBar.value = "";
    }

    // Show/Hide Filter Menu
    filterButton.addEventListener('click', (e)=>{
       filterMenu.classList.toggle('show');
    })

    // Hit enter to search from Filter Menu
    filterMenu.addEventListener('keydown', (e)=>{
        if(e.key === "Enter"){
            applyFilterButton.click();
        }
    })

    // Severity Selection Handler
    filterCategoryDropdown.addEventListener('input',(e)=>{
        if(filterCategoryDropdown.value === "Severity"){
            severitySelector.classList.remove('hide');
            searchInputContainer.classList.add('hide');
        }
        else{
            severitySelector.classList.add('hide');
            searchInputContainer.classList.remove('hide');
        }
    })

    // Apply Filter Button
    applyFilterButton.addEventListener('click', ()=>{
        const filter = filterCategoryDropdown.value;
        const value = filter === "Severity" ? severitySelector.value : searchBar.value;
        if(value.trim() !== ""){
            detectionFilters[filter] = value.trim();
            searchBar.value = "";
            displayFilters();
            filterDetectionItems();
        }
    })

    // Cancel Filter Menu
    cancelFilterButton.addEventListener('click', ()=>{
        hideFilterMenu();
    })

    // Clear All Filters Button
    clearFiltersButton.addEventListener('click', (e)=>{
        Object.keys(detectionFilters).forEach(key=>detectionFilters[key] = null);
        displayFilters();
        filterDetectionItems();
    })
})();

setData();