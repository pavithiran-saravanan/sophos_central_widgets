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
  const data = await fetch("/events").then(async (res) => await res.json());
  console.log(data);
  const items = data.items;
  const threatActorsCount = {};

  items.map((event) => {
    const path = getPath(event.name);
    if (path) {
      if (threatActorsCount[path]) {
        threatActorsCount[path]++;
      } else {
        threatActorsCount[path] = 1;
      }
    }
  });
  const tableData = [];

  Object.entries(threatActorsCount).forEach((entry) => {
    tableData.push({ name: entry[0], value: entry[1] });
  });
  console.log("chart loading...");
  const tableContainer = document.getElementById("table-container");
  tableContainer.innerHTML = generateTable(tableData);
}

function generateTable(tableData) {
  let table = "<table>";
  table += "<tr><th class=\"tableTitle alignLeft\">Actors</th><th class=\"tableTitle alignRight\">Frequency</th></tr>";
  tableData.forEach((item) => {
    const name = item.name.length > 150 ? item.name.substring(0, 150) : item.name;
    table += `<tr class=\"tableRow\"><td class=\"tableData alignLeft\">${name}</td><td class=\"tableData alignRight\">${item.value}</td></tr>`;
  });
  table += "</table>";
  return table;
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("data loading...");
  setData();
});