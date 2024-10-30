function getPath(str) {
  const regex = /'([^']+)'/g;

  const isPath = (text) => text.includes("/") || text.includes("\\");

  const paths = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    if (isPath(match[1])) {
      return match[1];
    }
  }
}
async function setData(params) {
  console.log("fetching data...");
  const alerts = await fetch("/alerts").then(async (res) => await res.json());
  console.log("data ", alerts);
  const alertCount = document.getElementById("alertCount");
  alertCount.innerText = alerts.items.length;

  const endpoints = await fetch("/endpoints").then(
    async (res) => await res.json()
  );
  console.log("data ", endpoints);
  const endpointItems = endpoints.items;
  let suspicious = 0;
  endpointItems.map((endpoint) => {
    const health = endpoint.health.overall;
    if (health !== "good") suspicious++;
  });
  const infectedEndpointsCount = document.getElementById(
    "infectedEndpointsCount"
  );
  infectedEndpointsCount.innerText = suspicious;

  const applicationData = await fetch("/applications").then(
    async (res) => await res.json()
  );
  const appConnectionsCount = document.getElementById("appConnectionsCount");
  appConnectionsCount.innerText = applicationData.pages.items;

  const eventsData = await fetch("/events").then(
    async (res) => await res.json()
  );
  const events = eventsData.items;
  let threatActors = 0;
  let PolicyViolationBlocked = 0;
  events.map((event) => {
    const type = event.type;
    const path = getPath(event.description);
    if (path) {
      threatActors++;
    }
    if ((type && type.includes("::BLOCKED")) || type.includes("::Blocked")) {
      PolicyViolationBlocked++;
    }
  });
  const threatActorsCount = document.getElementById("threatActorsCount");
  threatActorsCount.innerText = threatActors;
  const PolicyViolationBlockedCount = document.getElementById(
    "PolicyViolationBlocked"
  );
  PolicyViolationBlockedCount.innerText = PolicyViolationBlocked;
  const usersData = await fetch("/users").then(async (res) => await res.json());
  const usersCount = document.getElementById("usersCount");
  usersCount.innerText = usersData.items.length;
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("data loading...");
  setData();
});

// // Widget Behaviour
// const items = document.querySelectorAll('.overviewItem');
// console.log(items)
// const itemsPerRow = 6; // Define your items per row
// items.forEach((item, index) => {
//     if ((index + 1) % itemsPerRow === 0) {
//         item.classList.add('no-border'); // Add a class to the last item in each row
//     }
// });
