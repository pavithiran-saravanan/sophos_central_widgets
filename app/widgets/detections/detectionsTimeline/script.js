const actions = [
  "Isolate",
  "Delete",
  "Scan",
  "Update Adaptive Attack Protection",
];

// Helper function to obtain severity class for severity number
function getSeverityClass(severity) {
  if (severity > 10) return "critical";
  if (severity >= 8) return "high";
  if (severity >= 4) return "medium";
  if (severity >= 1) return "low";
  else return "info";
}

// DateTime Component
function getDateTimeComponent(date = "2024-09-18", time = "10:17:05") {
  const dateTimeContainer = document.createElement("div");
  dateTimeContainer.classList.add("dateTimeContainer");

  const timeElement = document.createElement("div");
  timeElement.classList.add("detectionTime");
  timeElement.innerText = time;

  const dateElement = document.createElement("div");
  dateElement.classList.add("detectionDate");
  dateElement.innerText = date;

  dateTimeContainer.append(timeElement, dateElement);
  return dateTimeContainer;
}

// TitleDescription Component
function getTitleComponent(title, description, severity = "high") {
  const titleContainer = document.createElement("div");
  titleContainer.classList.add("titleContainer", severity);

  const titleElement = document.createElement("div");
  titleElement.classList.add("detectionTitle");
  titleElement.innerText = title;

  const descriptionElement = document.createElement("div");
  descriptionElement.classList.add("detectionDescription");
  descriptionElement.innerText = description;

  titleContainer.append(titleElement, descriptionElement);
  return titleContainer;
}

// Function to create a new element with attributes
function createElement(tag, className = "", textContent = "") {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (textContent) el.textContent = textContent;
  return el;
}

// Function to construct the details section based on data provided
function createDetailsSection(data, showActions, showBlock) {
  const content = createElement("div", "details-content");

  Object.keys(data).forEach((key) => {
    const item = createElement("div", "details-item");
    const label = createElement("span", "details-label", key + ": ");
    const value = createElement("span", "", data[key]);
    item.appendChild(label);
    item.appendChild(value);

    // Add actions dropdown only beside the Device Entity in Detection tab
    if (showActions && key === "Device Entity") {
      item.appendChild(createActionsDropdown(actions));
    }

    if (showBlock && key === "sha256") {
      item.appendChild(
        createElement("button", "actions-button block-button", "Block")
      );
    }

    content.appendChild(item);
  });

  return content;
}

// Function to construct the Actions dropdown menu
function createActionsDropdown(actions) {
  const dropdownWrapper = createElement("div", "actions-dropdown");

  // Button for dropdown
  const actionsButton = createElement("button", "actions-button", "Actions ▼");
  dropdownWrapper.appendChild(actionsButton);

  // Dropdown menu
  const dropdownMenu = createElement("ul", "dropdown-menu");
  actions.forEach((action) => {
    const actionItem = createElement("li", action.split(" ")[0], action);
    dropdownMenu.appendChild(actionItem);
  });
  dropdownWrapper.appendChild(dropdownMenu);

  // Event to toggle dropdown visibility
  actionsButton.addEventListener("click", function () {
    dropdownMenu.classList.toggle("show");
  });

  // Handle dropdown item selection
  dropdownMenu.addEventListener("click", (event) => {
    // Record selection
    const clickedListItem = event.target;

    // Trigger action
    console.log(clickedListItem.className + " event triggered");

    // Close the menu
    dropdownMenu.classList.remove("show");
  });

  // Hide dropdown if clicked outside
  document.addEventListener("click", function (event) {
    if (!dropdownWrapper.contains(event.target)) {
      dropdownMenu.classList.remove("show");
    }
  });

  return dropdownWrapper;
}

// Function to handle tab switching
function switchTab(tabList, data, showActions, showBlock) {
  const detectionContainer = tabList.parentElement;
  const contentArea = detectionContainer.querySelector(".details-content-area");
  contentArea.innerHTML = ""; // Clear previous content
  contentArea.appendChild(createDetailsSection(data, showActions, showBlock)); // Insert new content
  // If Intelix tab, show reputation score widget
  if (data["Reputation Score"]) {
    contentArea.appendChild(
      getIntelixReputationWidget(data["Reputation Score"])
    );
  }
}

// Function to create and append the entire component
function createDetectionWidget(
  detectionTabData,
  mitreTabData,
  geoTabData,
  intelixTabData
) {
  const detectionContainer = createElement("div", "detection-container hide");

  // Create and append tab header
  const tabList = createElement("ul", "tab-list");
  const tabs = [
    { name: "Detection", data: detectionTabData, showActions: true },
    { name: "Mitre", data: mitreTabData, showActions: false },
    { name: "Geolocation", data: geoTabData, showActions: false },
    {
      name: "IntelixFileReputation",
      data: intelixTabData,
      showActions: false,
      showBlock: true,
    },
  ];
  tabs.forEach((tab) => {
    if (!tab.data) return;
    if (Object.keys(tab.data).length === 0) return;
    const tabElement = createElement("li", "tab", tab.name);
    if (tab.name === "Detection") tabElement.classList.add("active"); // Highlight active tab initially
    tabElement.addEventListener("click", function () {
      // When a tab is clicked, remove active class from all the other tabs in the tab group
      tabList
        .querySelectorAll(".tab")
        .forEach((tab) => tab.classList.remove("active"));
      tabElement.classList.add("active");
      switchTab(tabList, tab.data, tab.showActions, tab.showBlock);
    });
    tabList.appendChild(tabElement);
  });
  detectionContainer.appendChild(tabList);

  // Create content area for details
  const contentArea = createElement("div", "details-content-area");
  contentArea.appendChild(createDetailsSection(detectionTabData, true)); // Default content: Detection tab with actions
  detectionContainer.appendChild(contentArea);

  // Append the detectionContainer to the DOM
  // document.body.appendChild(detectionContainer);
  return detectionContainer;
}

function createDetectionContainer(
  date,
  time,
  title,
  desc,
  severity,
  detectionData,
  mitreData,
  geoData,
  inteliData
) {
  // Create Item Container
  const detectionItem = document.createElement("div");
  detectionItem.classList.add("detectionItem");

  // Create title details container
  const titleDetailsContainer = document.createElement("div");
  titleDetailsContainer.classList.add("titleDetailsContainer");

  // Get titleElement
  const titleElement = getTitleComponent(title, desc, severity);

  // Add elements to titleDetailsContainer
  titleDetailsContainer.append(
    titleElement,
    createDetectionWidget(detectionData, mitreData, geoData, inteliData)
  );

  // Add elements to container
  detectionItem.append(getDateTimeComponent(date, time), titleDetailsContainer);

  // Add to dom
  document.querySelector("#timeline").append(detectionItem, getGapElement());

  // Hide and show Item details
  detectionItem
    .querySelector(".titleContainer")
    .addEventListener("click", () => {
      const details = detectionItem.querySelector(".detection-container");
      details.classList.toggle("hide");
    });
}

function getGapElement() {
  const gapline = document.createElement("div");
  gapline.textContent = "";
  gapline.classList.add("gapline");
  return gapline;
}

async function setData(params) {
  console.log("fetching data...");
  const data = await fetch("/detections/results").then(
    async (res) => await res.json()
  );
  console.log(data);
  const detectionsList = data.items;

  detectionsList.forEach((detection) => {
    // Get data for dateTimeComponent
    const dateTimeSplit = detection.time.split("T");
    const date = dateTimeSplit[0];
    const time = dateTimeSplit[1].split(".")[0];

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
      "Device Type": detection.device.type,
    };
    const geolocationTabData = {
      "Public IP": detection.geolocation[0].fieldValue,
      City: detection.geolocation[0].city,
      State: detection.geolocation[0].state,
      Country: detection.geolocation[0].country,
      "Country Code": detection.geolocation[0].countryCode,
      Postal: detection.geolocation[0].postal,
      Latitude: detection.geolocation[0].latitude,
      Longitude: detection.geolocation[0].longitude,
    };
    let mitreTabData = {};
    if (detection.mitreAttacks && detection.mitreAttacks.length > 0) {
      mitreTabData = {
        "Tactic Id": detection.mitreAttacks[0].tactic.id,
        "Tactic Name": detection.mitreAttacks[0].tactic.name,
        "Technique Id": detection.mitreAttacks[0].tactic.techniques[0].id,
        "Technique Name": detection.mitreAttacks[0].tactic.techniques[0].name,
      };
    }
    let intelixTabData = {};
    if (detection.intelixFileReputation) {
      intelixTabData = {
        sha256: detection.intelixFileReputation[0].fieldValue,
        "Reputation Score": detection.intelixFileReputation[0].reputationScore,
      };
    }

    createDetectionContainer(
      date,
      time,
      title,
      description,
      severity,
      detectionTabData,
      mitreTabData,
      geolocationTabData,
      intelixTabData
    );
  });
}

function getIntelixReputationWidget(score) {
  const reputationScoreWidget = createElement("div", "reputationScoreWidget");
  const scorePointerContainer = createElement("div", "scorePointerContainer");
  const scorePointer = createElement("div", "scorePointer");
  const scoreBar = createElement("div", "scoreBar");
  const scoreText = createElement("div", "scoreText");
  const scoreValue = createElement("span", "scoreValue", score);

  // Score Pointer Container
  scorePointerContainer.append(scorePointer);
  scorePointer.style.left = 12 + (score / 100) * 76 + "%";

  // Score Bar
  for (let i = 0; i < 5; i++) {
    scoreBar.appendChild(createElement("span"));
  }

  // Score Text
  scoreText.textContent = "Reputation Score = ";
  scoreText.append(scoreValue);

  reputationScoreWidget.append(scorePointerContainer, scoreBar, scoreText);
  return reputationScoreWidget;
}

setData();
