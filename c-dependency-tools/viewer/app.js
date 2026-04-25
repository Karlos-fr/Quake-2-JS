import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const svg = d3.select("#graph");
const searchInput = document.querySelector("#search-input");
const relationFilter = document.querySelector("#relation-filter");
const weightFilter = document.querySelector("#weight-filter");
const weightValue = document.querySelector("#weight-value");
const isolateFilter = document.querySelector("#isolate-filter");
const resetButton = document.querySelector("#reset-view");
const statsRoot = document.querySelector("#stats");
const detailsEmpty = document.querySelector("#details-empty");
const detailsContent = document.querySelector("#details-content");
const detailsBackButton = document.querySelector("#details-back-button");
const tableBody = document.querySelector("#dependency-table-body");
const tableSummary = document.querySelector("#table-summary");
const dependencyTable = document.querySelector("#dependency-table");
const tableWrap = document.querySelector(".table-wrap");
const tableColumns = Array.from(document.querySelectorAll("#dependency-table col[data-col-key]"));
const columnFilters = Array.from(document.querySelectorAll(".column-filter"));
const statusFilters = Array.from(document.querySelectorAll(".status-filter"));
const graphStatusFilters = Array.from(document.querySelectorAll(".graph-status-filter-input"));
const sortButtons = Array.from(document.querySelectorAll(".sort-button"));
const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
const viewPanels = Array.from(document.querySelectorAll(".view-panel"));
const shellRoot = document.querySelector("#shell");
const sidebarToggle = document.querySelector("#sidebar-toggle");
const columnResizers = Array.from(document.querySelectorAll(".col-resizer"));
const resetTableFiltersButton = document.querySelector("#reset-table-filters");
const refreshPortageDataButton = document.querySelector("#refresh-portage-data");

const COLUMN_WIDTHS_STORAGE_KEY = "quake2:c-dependency-tools:column-widths";
const DEFAULT_COLUMN_WIDTHS = {
  portingPriority: 88,
  path: 280,
  module: 110,
  aPorter: 86,
  porte: 80,
  valide: 80,
  cible: 220,
  incomingCount: 92,
  outgoingCount: 92,
  incomingWeight: 108,
  outgoingWeight: 108,
  functionsDefined: 92
};
const MIN_COLUMN_WIDTHS = {
  portingPriority: 70,
  path: 180,
  module: 90,
  aPorter: 72,
  porte: 72,
  valide: 72,
  cible: 110,
  incomingCount: 84,
  outgoingCount: 84,
  incomingWeight: 96,
  outgoingWeight: 96,
  functionsDefined: 84
};

const state = {
  graphData: null,
  portageMetadata: new Map(),
  selectedNode: null,
  selectedLink: null,
  simulation: null,
  moduleAnchors: new Map(),
  positions: new Map(),
  visibleNodes: [],
  visibleLinks: [],
  detailsHistory: [],
  activeTab: "graph",
  sidebarCollapsed: false,
  columnWidths: loadColumnWidths(),
  graphFilters: {
    aPorter: []
  },
  tableFilters: {
    portingPriority: "",
    path: "",
    module: "",
    aPorter: [],
    porte: [],
    valide: [],
    cible: "",
    incomingCount: "",
    outgoingCount: "",
    incomingWeight: "",
    outgoingWeight: "",
    functionsDefined: ""
  },
  sort: {
    key: "portingPriority",
    direction: "desc"
  }
};

const width = () => {
  if (window.innerWidth <= 980) {
    return window.innerWidth;
  }

  return window.innerWidth - (state.sidebarCollapsed ? 64 : 380);
};
const height = () => (window.innerWidth > 980 ? Math.max(window.innerHeight - 96, 560) : Math.max(window.innerHeight * 0.7, 560));

const zoomLayer = svg.append("g");
const linkLayer = zoomLayer.append("g");
const nodeLayer = zoomLayer.append("g");

defineArrowMarkers();

const zoom = d3
  .zoom()
  .scaleExtent([0.18, 4])
  .on("zoom", (event) => {
    zoomLayer.attr("transform", event.transform);
  });

svg.call(zoom);
svg.on("click", (event) => {
  if (event.target === svg.node()) {
    deselectAll();
  }
});

resetButton.addEventListener("click", () => {
  svg.transition().duration(500).call(zoom.transform, defaultTransform());
});
detailsBackButton.addEventListener("click", navigateDetailsBack);
detailsContent.addEventListener("click", handleDetailsContentClick);

searchInput.addEventListener("input", render);
relationFilter.addEventListener("change", render);
weightFilter.addEventListener("input", () => {
  weightValue.textContent = weightFilter.value;
  render();
});
isolateFilter.addEventListener("change", render);
sidebarToggle.addEventListener("click", () => {
  state.sidebarCollapsed = !state.sidebarCollapsed;
  shellRoot.classList.toggle("sidebar-collapsed", state.sidebarCollapsed);
  sidebarToggle.textContent = state.sidebarCollapsed ? "Ouvrir" : "Replier";
  sidebarToggle.setAttribute("aria-expanded", state.sidebarCollapsed ? "false" : "true");

  if (!state.graphData) {
    return;
  }

  buildModuleAnchors(state.graphData.graph.nodes);
  render();
  if (state.activeTab === "graph") {
    svg.call(zoom.transform, defaultTransform());
  }
});

window.addEventListener("resize", () => {
  if (!state.graphData) {
    return;
  }

  buildModuleAnchors(state.graphData.graph.nodes);
  seedInitialPositions(state.graphData.graph.nodes);
  render();

  if (state.activeTab === "graph") {
    svg.call(zoom.transform, defaultTransform());
  }
});

for (const button of sortButtons) {
  button.addEventListener("click", () => {
    const key = button.dataset.sortKey;
    if (state.sort.key === key) {
      state.sort.direction = state.sort.direction === "asc" ? "desc" : "asc";
    } else {
      state.sort.key = key;
      state.sort.direction = key === "path" || key === "module" ? "asc" : "desc";
    }

    updateSortButtons();
    renderTable(state.visibleNodes, state.visibleLinks);
  });
}

for (const button of tabButtons) {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.tab);
  });
}

for (const resizer of columnResizers) {
  resizer.addEventListener("mousedown", startColumnResize);
}

for (const filterInput of columnFilters) {
  filterInput.addEventListener("input", handleTableFilterChange);
  filterInput.addEventListener("change", handleTableFilterChange);
}

for (const filterInput of statusFilters) {
  filterInput.addEventListener("change", handleStatusFilterChange);
}

for (const filterInput of graphStatusFilters) {
  filterInput.addEventListener("change", handleGraphStatusFilterChange);
}

resetTableFiltersButton.addEventListener("click", resetTableFilters);
refreshPortageDataButton.addEventListener("click", refreshPortageMetadata);

load();

async function load() {
  const [payload, portageText] = await Promise.all([d3.json("../data/c-dependency-graph.json"), fetchPortageMarkdown()]);
  state.graphData = payload;
  state.portageMetadata = parsePortageMetadata(portageText);
  buildModuleAnchors(payload.graph.nodes);
  seedInitialPositions(payload.graph.nodes);
  renderStats(payload);
  updateSortButtons();
  applyColumnWidths();
  setActiveTab("graph");
  render();
  svg.call(zoom.transform, defaultTransform());
}

function render() {
  if (!state.graphData) {
    return;
  }

  const relationMode = relationFilter.value;
  const minWeight = Number(weightFilter.value);
  const query = searchInput.value.trim().toLowerCase();
  const aPorterFilter = state.graphFilters.aPorter;

  svg.attr("viewBox", `${-width() / 2} ${-height() / 2} ${width()} ${height()}`);

  const filteredLinks = state.graphData.graph.links.filter((link) => {
    if (link.weight < minWeight) {
      return false;
    }

    if (relationMode !== "all" && !link.relationTypes.includes(relationMode)) {
      return false;
    }

    if (!query) {
      return true;
    }

    return link.source.toLowerCase().includes(query) || link.target.toLowerCase().includes(query);
  });

  const visibleNodeIds = new Set();
  for (const link of filteredLinks) {
    visibleNodeIds.add(link.source);
    visibleNodeIds.add(link.target);
  }

  const filteredNodes = state.graphData.graph.nodes.filter((node) => {
    const matchesQuery = !query || node.path.toLowerCase().includes(query) || node.label.toLowerCase().includes(query);
    if (!matchesQuery) {
      return false;
    }

    if (!matchesGraphAporterFilter(node, aPorterFilter)) {
      return false;
    }

    if (!isolateFilter.checked) {
      return true;
    }

    return visibleNodeIds.has(node.id);
  });

  const filteredNodeIdSet = new Set(filteredNodes.map((node) => node.id));
  const finalLinks = filteredLinks.filter(
    (link) => filteredNodeIdSet.has(displayNodeId(link.source)) && filteredNodeIdSet.has(displayNodeId(link.target))
  );

  state.visibleNodes = filteredNodes;
  state.visibleLinks = finalLinks;

  drawGraph(filteredNodes, finalLinks);
  renderTable(filteredNodes, finalLinks);
}

function drawGraph(nodes, links) {
  const nodesForSim = nodes.map((node) => {
    const seeded = state.positions.get(node.id) ?? fallbackPosition(node.id, node.module);
    return {
      ...node,
      x: seeded.x,
      y: seeded.y
    };
  });

  const nodeMap = new Map(nodesForSim.map((node) => [node.id, node]));
  const linksForSim = links.map((link) => ({
    ...link,
    source: nodeMap.get(displayNodeId(link.source)),
    target: nodeMap.get(displayNodeId(link.target))
  }));

  if (state.simulation) {
    state.simulation.stop();
  }

  state.simulation = d3
    .forceSimulation(nodesForSim)
    .alpha(1)
    .alphaDecay(0.03)
    .velocityDecay(0.26)
    .force(
      "link",
      d3
        .forceLink(linksForSim)
        .id((node) => node.id)
        .distance((link) => 110 + Math.min(240, link.weight * 16))
        .strength((link) => Math.max(0.08, 0.28 - link.weight * 0.01))
    )
    .force("charge", d3.forceManyBody().strength((node) => -420 - Math.min(500, node.functionsDefined * 5)))
    .force("center", d3.forceCenter(0, 0))
    .force("x", d3.forceX((node) => moduleAnchor(node.module).x).strength(0.11))
    .force("y", d3.forceY((node) => moduleAnchor(node.module).y).strength(0.11))
    .force("collision", d3.forceCollide().radius((node) => nodeRadius(node) + 28));

  const linkSelection = linkLayer
    .selectAll("line")
    .data(linksForSim, (link) => `${displayNodeId(link.source)}->${displayNodeId(link.target)}`);

  linkSelection.exit().remove();

  const linkEnter = linkSelection
    .enter()
    .append("line")
    .attr("class", (link) => `link ${relationClass(link)}`)
    .attr("stroke-width", (link) => Math.max(1.4, Math.log2(link.weight + 1) * 1.6))
    .on("click", (event, link) => {
      event.stopPropagation();
      state.selectedLink = link;
      state.selectedNode = null;
      renderDetailsForLink(link);
      highlight(link);
    });

  const linksMerged = linkEnter
    .merge(linkSelection)
    .attr("class", (link) => `link ${relationClass(link)}`)
    .attr("stroke-width", (link) => Math.max(1.4, Math.log2(link.weight + 1) * 1.6));

  const nodeSelection = nodeLayer.selectAll("g.node").data(nodesForSim, (node) => node.id);
  nodeSelection.exit().remove();

  const nodeEnter = nodeSelection
    .enter()
    .append("g")
    .attr("class", (node) => buildNodeClass(node))
    .call(drag(state.simulation))
    .on("click", (event, node) => {
      event.stopPropagation();
      selectNodeById(node.id, { pushHistory: true });
    });

  nodeEnter
    .append("circle")
    .attr("class", "node-main-circle")
    .attr("r", (node) => nodeRadius(node))
    .attr("fill", (node) => portageStatusAppearance(node.id).fill);

  nodeEnter
    .append("circle")
    .attr("class", "node-status-dot")
    .attr("r", 7)
    .attr("cx", (node) => nodeRadius(node) - 1)
    .attr("cy", (node) => -nodeRadius(node) + 1)
    .attr("fill", (node) => portageStatusAppearance(node.id).fill);

  nodeEnter
    .append("text")
    .attr("class", "node-status-glyph")
    .attr("x", (node) => nodeRadius(node) - 1)
    .attr("y", (node) => -nodeRadius(node) + 1)
    .text((node) => portageStatusAppearance(node.id).glyph);

  nodeEnter
    .append("text")
    .attr("class", "node-label")
    .attr("x", (node) => nodeRadius(node) + 8)
    .attr("y", 4)
    .text((node) => node.label);

  const nodesMerged = nodeEnter.merge(nodeSelection).attr("class", (node) => buildNodeClass(node));
  nodesMerged
    .select(".node-main-circle")
    .attr("r", (node) => nodeRadius(node))
    .attr("fill", (node) => portageStatusAppearance(node.id).fill);
  nodesMerged
    .select(".node-status-dot")
    .attr("cx", (node) => nodeRadius(node) - 1)
    .attr("cy", (node) => -nodeRadius(node) + 1)
    .attr("fill", (node) => portageStatusAppearance(node.id).fill);
  nodesMerged
    .select(".node-status-glyph")
    .attr("x", (node) => nodeRadius(node) - 1)
    .attr("y", (node) => -nodeRadius(node) + 1)
    .text((node) => portageStatusAppearance(node.id).glyph);
  nodesMerged.select(".node-label").attr("x", (node) => nodeRadius(node) + 8).text((node) => node.label);

  state.simulation.on("tick", () => {
    linksMerged
      .attr("x1", (link) => link.source.x)
      .attr("y1", (link) => link.source.y)
      .attr("x2", (link) => link.target.x)
      .attr("y2", (link) => link.target.y);

    nodesMerged.attr("transform", (node) => `translate(${node.x},${node.y})`);

    for (const node of nodesForSim) {
      state.positions.set(node.id, { x: node.x, y: node.y });
    }
  });

  state.simulation.alpha(1).restart();

  if (state.selectedNode) {
    const refreshedNode = nodesForSim.find((node) => node.id === state.selectedNode.id);
    if (refreshedNode) {
      renderDetailsForNode(refreshedNode);
      highlight(refreshedNode);
      return;
    }
  }

  if (state.selectedLink) {
    const refreshedLink = linksForSim.find(
      (link) =>
        displayNodeId(link.source) === displayNodeId(state.selectedLink.source) &&
        displayNodeId(link.target) === displayNodeId(state.selectedLink.target)
    );
    if (refreshedLink) {
      renderDetailsForLink(refreshedLink);
      highlight(refreshedLink);
      return;
    }
  }

  clearHighlight();
}

function renderStats(payload) {
  const items = [
    ["Fichiers", payload.summary.totalFiles],
    ["Fonctions detectees", payload.summary.totalFunctionsDefined],
    ["Liens include", payload.summary.totalIncludeLinks],
    ["Liens appels", payload.summary.totalCallLinks],
    ["Liens totaux", payload.summary.totalGraphLinks]
  ];

  statsRoot.innerHTML = items.map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`).join("");
}

function renderDetailsForNode(node) {
  const file = state.graphData.files.find((entry) => entry.path === node.id);
  if (!file) {
    return;
  }

  const incomingDependencies = collectIncomingDependencies(file.path, state.visibleLinks);
  const outgoingDependencies = collectOutgoingDependencies(file.path, state.visibleLinks);
  const portage = state.portageMetadata.get(normalizePath(file.path)) ?? null;

  detailsEmpty.hidden = true;
  detailsContent.hidden = false;
  detailsContent.innerHTML = `
    <p><strong>${escapeHtml(file.path)}</strong></p>
    <p>Module: ${escapeHtml(file.module)}</p>
    <p>Description / role: ${escapeHtml(portage?.description ?? "-")}</p>
    <p>A porter: ${escapeHtml(portage?.aPorter ?? "-")}</p>
    <p>Porte: ${escapeHtml(portage?.porte ?? "-")}</p>
    <p>Valide: ${escapeHtml(portage?.valide ?? "-")}</p>
    <p>Cible: ${escapeHtml(portage?.cible ?? "-")}</p>
    <p>Fonctions definies: ${file.functionsDefined.length}</p>
    <p>Includes internes: ${file.includes.length}</p>
    <p>Includes externes: ${file.externalIncludes.length}</p>
    <p>Dependances entrantes visibles: ${countIncomingLinks(file.path, state.visibleLinks)}</p>
    <p>Dependances sortantes visibles: ${countOutgoingLinks(file.path, state.visibleLinks)}</p>
    <div class="details-block">
      <h3>Dependances entrantes</h3>
      <ul>${incomingDependencies.map((item) => renderDependencyItem(item)).join("") || "<li>Aucune</li>"}</ul>
    </div>
    <div class="details-block">
      <h3>Dependances sortantes</h3>
      <ul>${outgoingDependencies.map((item) => renderDependencyItem(item)).join("") || "<li>Aucune</li>"}</ul>
    </div>
    <div class="details-block">
      <h3>Fonctions principales</h3>
      <ul>${file.functionsDefined.slice(0, 12).map((fn) => `<li>${escapeHtml(fn.name)}</li>`).join("") || "<li>Aucune</li>"}</ul>
    </div>
  `;
  updateDetailsBackButton();
}

function renderDetailsForLink(link) {
  detailsEmpty.hidden = true;
  detailsContent.hidden = false;
  detailsContent.innerHTML = `
    <p><strong>${escapeHtml(displayNodeId(link.source))} -> ${escapeHtml(displayNodeId(link.target))}</strong></p>
    <p>Poids: ${link.weight}</p>
    <p>Includes: ${link.includeCount}</p>
    <p>Appels: ${link.callCount}</p>
    <p>Fonctions reliees:</p>
    <ul>${link.functions.slice(0, 16).map((fn) => `<li>${escapeHtml(fn)}</li>`).join("") || "<li>Aucune</li>"}</ul>
  `;
  updateDetailsBackButton();
}

function highlight(subject) {
  const isNode = "id" in subject;
  const selectedId = isNode ? subject.id : null;
  const selectedSource = isNode ? null : displayNodeId(subject.source);
  const selectedTarget = isNode ? null : displayNodeId(subject.target);

  nodeLayer.selectAll("g.node").classed("dimmed", (node) => {
    if (isNode) {
      return node.id !== selectedId;
    }

    return node.id !== selectedSource && node.id !== selectedTarget;
  });

  nodeLayer.selectAll("g.node").classed("active", (node) => {
    if (isNode) {
      return node.id === selectedId;
    }

    return node.id === selectedSource || node.id === selectedTarget;
  });

  linkLayer.selectAll("line.link").classed("dimmed", (link) => {
    if (isNode) {
      return displayNodeId(link.source) !== selectedId && displayNodeId(link.target) !== selectedId;
    }

    return displayNodeId(link.source) !== selectedSource || displayNodeId(link.target) !== selectedTarget;
  });

  renderTable(state.visibleNodes, state.visibleLinks);
}

function clearHighlight() {
  nodeLayer.selectAll("g.node").classed("dimmed", false).classed("active", false);
  linkLayer.selectAll("line.link").classed("dimmed", false);
  detailsEmpty.hidden = false;
  detailsContent.hidden = true;
  detailsContent.innerHTML = "";
  updateDetailsBackButton();
  renderTable(state.visibleNodes, state.visibleLinks);
}

function renderTable(nodes, links) {
  const rows = sortTableRows(filterTableRows(buildTableMetrics(nodes, links)));
  const selectedId = state.selectedNode ? state.selectedNode.id : null;

  tableSummary.textContent = `${rows.length} fichier(s) visibles`;
  tableBody.innerHTML = rows
    .map(
      (row) => `
        <tr data-node-id="${escapeHtml(row.id)}" class="${row.id === selectedId ? "active-row" : ""}">
          <td><span class="metric-chip priority-chip">${row.portingPriority}</span></td>
          <td class="file-cell">${escapeHtml(row.path)}</td>
          <td>${escapeHtml(row.module)}</td>
          <td class="status-cell" title="${escapeHtml(row.aPorter)}"><span class="status-badge">${escapeHtml(row.aPorterShort)}</span></td>
          <td class="status-cell" title="${escapeHtml(row.porte)}"><span class="status-badge">${escapeHtml(row.porteShort)}</span></td>
          <td class="status-cell" title="${escapeHtml(row.valide)}"><span class="status-badge">${escapeHtml(row.valideShort)}</span></td>
          <td class="target-cell" title="${escapeHtml(row.cible)}">${escapeHtml(row.cible)}</td>
          <td><span class="metric-chip">${row.incomingCount}</span></td>
          <td><span class="metric-chip">${row.outgoingCount}</span></td>
          <td><span class="metric-chip">${row.incomingWeight}</span></td>
          <td><span class="metric-chip">${row.outgoingWeight}</span></td>
          <td><span class="metric-chip">${row.functionsDefined}</span></td>
        </tr>
      `
    )
    .join("");

  for (const row of tableBody.querySelectorAll("tr")) {
    row.addEventListener("click", () => {
      const node = nodes.find((entry) => entry.id === row.dataset.nodeId);
      if (!node) {
        return;
      }

      selectNodeById(node.id, { pushHistory: true });
    });
  }

  applyColumnWidths();
}

function buildTableMetrics(nodes, links) {
  const rows = new Map(
    nodes.map((node) => [
      node.id,
      {
        id: node.id,
        path: node.path,
        module: node.module,
        incomingCount: 0,
        outgoingCount: 0,
        incomingWeight: 0,
        outgoingWeight: 0,
        functionsDefined: node.functionsDefined,
        portingPriority: 0,
        aPorter: "",
        aPorterShort: "",
        porte: "",
        porteShort: "",
        valide: "",
        valideShort: "",
        cible: ""
      }
    ])
  );

  for (const link of links) {
    const sourceId = displayNodeId(link.source);
    const targetId = displayNodeId(link.target);
    const source = rows.get(sourceId);
    const target = rows.get(targetId);

    if (source) {
      source.outgoingCount += 1;
      source.outgoingWeight += link.weight;
    }

    if (target) {
      target.incomingCount += 1;
      target.incomingWeight += link.weight;
    }
  }

  return Array.from(rows.values()).map((row) => {
    const metadata = state.portageMetadata.get(normalizePath(row.path)) ?? null;
    return {
      ...row,
      portingPriority: computePortingPriority(row),
      aPorter: metadata?.aPorter ?? "",
      aPorterShort: shortenStatus(metadata?.aPorter ?? ""),
      porte: metadata?.porte ?? "",
      porteShort: shortenStatus(metadata?.porte ?? ""),
      valide: metadata?.valide ?? "",
      valideShort: shortenStatus(metadata?.valide ?? ""),
      cible: metadata?.cible ?? ""
    };
  });
}

function sortTableRows(rows) {
  const direction = state.sort.direction === "asc" ? 1 : -1;
  const key = state.sort.key;

  return [...rows].sort((left, right) => {
    const leftValue = left[key];
    const rightValue = right[key];

    if (typeof leftValue === "string") {
      const compared = leftValue.localeCompare(rightValue);
      return compared === 0 ? left.path.localeCompare(right.path) : compared * direction;
    }

    const compared = leftValue - rightValue;
    return compared === 0 ? left.path.localeCompare(right.path) : compared * direction;
  });
}

function updateSortButtons() {
  const labels = {
    portingPriority: "Priorite",
    path: "Fichier",
    module: "Module",
    incomingCount: "Entrantes",
    outgoingCount: "Sortantes",
    incomingWeight: "Poids entrant",
    outgoingWeight: "Poids sortant",
    functionsDefined: "Fonctions"
  };

  for (const button of sortButtons) {
    const key = button.dataset.sortKey;
    const active = state.sort.key === key;
    const suffix = active ? (state.sort.direction === "asc" ? " [asc]" : " [desc]") : "";
    button.textContent = `${labels[key]}${suffix}`;
  }
}

function setActiveTab(tabName) {
  state.activeTab = tabName;

  for (const button of tabButtons) {
    const isActive = button.dataset.tab === tabName;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  }

  for (const panel of viewPanels) {
    const isActive = panel.dataset.panel === tabName;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  }

  if (tabName === "graph") {
    requestAnimationFrame(() => {
      if (!state.graphData) {
        return;
      }

      render();
      svg.call(zoom.transform, defaultTransform());
    });
  }
}

function buildModuleAnchors(nodes) {
  const modules = Array.from(new Set(nodes.map((node) => node.module))).sort((left, right) => left.localeCompare(right));
  const radius = Math.min(width(), height()) * 0.3;
  state.moduleAnchors = new Map();

  modules.forEach((module, index) => {
    const angle = (index / Math.max(1, modules.length)) * Math.PI * 2;
    state.moduleAnchors.set(module, {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    });
  });
}

function seedInitialPositions(nodes) {
  const grouped = d3.group(nodes, (node) => node.module);

  for (const [module, members] of grouped.entries()) {
    const anchor = moduleAnchor(module);
    const ringRadius = 46 + members.length * 2.6;

    members.forEach((node, index) => {
      if (state.positions.has(node.id)) {
        return;
      }

      const angle = (index / Math.max(1, members.length)) * Math.PI * 2;
      state.positions.set(node.id, {
        x: anchor.x + Math.cos(angle) * ringRadius,
        y: anchor.y + Math.sin(angle) * ringRadius
      });
    });
  }
}

function fallbackPosition(id, module) {
  const anchor = moduleAnchor(module);
  const angle = ((hashString(id) % 360) * Math.PI) / 180;
  const distance = 50 + (hashString(`${module}:${id}`) % 160);

  return {
    x: anchor.x + Math.cos(angle) * distance,
    y: anchor.y + Math.sin(angle) * distance
  };
}

function moduleAnchor(module) {
  return state.moduleAnchors.get(module) ?? { x: 0, y: 0 };
}

function nodeRadius(node) {
  return 7 + Math.min(22, Math.sqrt(node.functionsDefined * 2 + node.includeCount + 4));
}

function relationClass(link) {
  if (link.includeCount > 0 && link.callCount > 0) {
    return "both";
  }

  if (link.callCount > 0) {
    return "call";
  }

  return "include";
}

function buildNodeClass(node) {
  return `node${node.functionsDefined === 0 ? " secondary" : ""}`;
}

function colorForModule(module) {
  const palette = d3.scaleOrdinal(
    [
      "client",
      "ctf",
      "game",
      "linux",
      "null",
      "qcommon",
      "ref_gl",
      "ref_soft",
      "server",
      "win32",
      "."
    ],
    ["#8c3b1d", "#b45f06", "#875d1d", "#1f6f8b", "#3a7f58", "#8a4f7d", "#5862b3", "#4974a5", "#3f637a", "#7b4d2b", "#5e5a54"]
  );

  return palette(module);
}

function defaultTransform() {
  return d3.zoomIdentity.translate(width() / 2, height() / 2).scale(0.78);
}

function countOutgoingLinks(nodeId, links) {
  return links.filter((link) => displayNodeId(link.source) === nodeId).length;
}

function countIncomingLinks(nodeId, links) {
  return links.filter((link) => displayNodeId(link.target) === nodeId).length;
}

function computePortingPriority(row) {
  const score =
    100
    - row.incomingCount * 12
    - row.outgoingCount * 8
    - row.incomingWeight * 5
    - row.outgoingWeight * 3
    - Math.min(row.functionsDefined, 40) * 0.6;

  return Math.max(0, Math.round(score));
}

function collectIncomingDependencies(nodeId, links) {
  return links
    .filter((link) => displayNodeId(link.target) === nodeId)
    .map((link) => formatDependencyLabel(link, "incoming"))
    .sort((left, right) => left.file.localeCompare(right.file));
}

function collectOutgoingDependencies(nodeId, links) {
  return links
    .filter((link) => displayNodeId(link.source) === nodeId)
    .map((link) => formatDependencyLabel(link, "outgoing"))
    .sort((left, right) => left.file.localeCompare(right.file));
}

function formatDependencyLabel(link, direction) {
  const relatedFile = direction === "incoming" ? displayNodeId(link.source) : displayNodeId(link.target);
  const relation = link.relationTypes.join("+");
  return {
    file: relatedFile,
    label: `${relatedFile} (${relation}, poids ${link.weight})`
  };
}

function deselectAll() {
  state.selectedNode = null;
  state.selectedLink = null;
  clearHighlight();
}

function defineArrowMarkers() {
  const defs = svg.append("defs");
  const markerSpecs = [
    { id: "arrow-default", color: "#6e5846" },
    { id: "arrow-include", color: "#b45f06" },
    { id: "arrow-call", color: "#1f6f8b" },
    { id: "arrow-both", color: "#6f4ca6" }
  ];

  for (const spec of markerSpecs) {
    defs
      .append("marker")
      .attr("id", spec.id)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 9)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", spec.color);
  }
}

function displayNodeId(nodeRef) {
  return typeof nodeRef === "string" ? nodeRef : nodeRef.id;
}

function drag(simulation) {
  return d3
    .drag()
    .on("start", (event, node) => {
      if (!event.active) {
        simulation.alphaTarget(0.2).restart();
      }

      node.fx = node.x;
      node.fy = node.y;
    })
    .on("drag", (event, node) => {
      node.fx = event.x;
      node.fy = event.y;
    })
    .on("end", (event, node) => {
      if (!event.active) {
        simulation.alphaTarget(0);
      }

      node.fx = null;
      node.fy = null;
    });
}

function hashString(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parsePortageMetadata(markdownText) {
  const lines = markdownText.split(/\r?\n/);
  const tableStart = lines.findIndex((line) =>
    line.trim() === "| Path | Nom | Description / role | A porter | Porte | Valide | Cible |" ||
    line.trim() === "| Path | Nom | Description / role | A porter | Porte | Cible |"
  );
  if (tableStart === -1) {
    return new Map();
  }

  const metadata = new Map();
  for (let index = tableStart + 2; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim().startsWith("|")) {
      break;
    }

    const cells = splitMarkdownRow(line);
    if (cells.length < 6) {
      continue;
    }

    const pathKey = normalizePath(cells[0]);
    const hasValideColumn = cells.length >= 7;
    metadata.set(pathKey, {
      description: cells[2].trim(),
      aPorter: cells[3].trim(),
      porte: cells[4].trim(),
      valide: hasValideColumn ? cells[5].trim() : "",
      cible: hasValideColumn ? cells[6].trim() : cells[5].trim()
    });
  }

  return metadata;
}

function splitMarkdownRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function normalizePath(value) {
  return String(value).replaceAll("\\", "/").trim();
}

function shortenStatus(value) {
  return value.trim() || "-";
}

async function refreshPortageMetadata() {
  const previousLabel = refreshPortageDataButton.textContent;
  refreshPortageDataButton.disabled = true;
  refreshPortageDataButton.textContent = "Refresh...";

  try {
    const portageText = await fetchPortageMarkdown();
    state.portageMetadata = parsePortageMetadata(portageText);
    render();
  } catch (error) {
    console.error("Unable to refresh markdown metadata", error);
  } finally {
    refreshPortageDataButton.disabled = false;
    refreshPortageDataButton.textContent = previousLabel;
  }
}

async function fetchPortageMarkdown() {
  const response = await fetch(`/PORTAGE_QUAKE2.md?ts=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load PORTAGE_QUAKE2.md: ${response.status}`);
  }

  return response.text();
}

function handleTableFilterChange(event) {
  const key = event.currentTarget.dataset.filterKey;
  state.tableFilters[key] = event.currentTarget.value.trim();
  renderTable(state.visibleNodes, state.visibleLinks);
}

function handleStatusFilterChange(event) {
  const key = event.currentTarget.dataset.filterKey;
  state.tableFilters[key] = statusFilters
    .filter((input) => input.dataset.filterKey === key && input.checked)
    .map((input) => input.value.trim());
  renderTable(state.visibleNodes, state.visibleLinks);
}

function handleGraphStatusFilterChange() {
  state.graphFilters.aPorter = graphStatusFilters.filter((input) => input.checked).map((input) => input.value.trim());
  render();
}

function filterTableRows(rows) {
  return rows.filter((row) => {
    for (const [key, rawFilter] of Object.entries(state.tableFilters)) {
      if (Array.isArray(rawFilter) && rawFilter.length === 0) {
        continue;
      }

      if (!Array.isArray(rawFilter) && !rawFilter) {
        continue;
      }

      if (key === "aPorter" || key === "porte" || key === "valide") {
        const normalizedValue = String(row[key] ?? "").trim();
        const matchesEmpty = rawFilter.includes("__empty__") && normalizedValue.length === 0;
        if (!matchesEmpty && !rawFilter.includes(normalizedValue)) {
          return false;
        }
        continue;
      }

      if (
        key === "portingPriority" ||
        key === "incomingCount" ||
        key === "outgoingCount" ||
        key === "incomingWeight" ||
        key === "outgoingWeight" ||
        key === "functionsDefined"
      ) {
        if (Number(row[key]) < Number(rawFilter)) {
          return false;
        }
        continue;
      }

      const haystack = String(row[key] ?? "").toLowerCase();
      const needle = rawFilter.toLowerCase();
      if (!haystack.includes(needle)) {
        return false;
      }
    }

    return true;
  });
}

function resetTableFilters() {
  state.tableFilters = {
    portingPriority: "",
    path: "",
    module: "",
    aPorter: [],
    porte: [],
    valide: [],
    cible: "",
    incomingCount: "",
    outgoingCount: "",
    incomingWeight: "",
    outgoingWeight: "",
    functionsDefined: ""
  };

  for (const input of columnFilters) {
    input.value = "";
  }

  for (const input of statusFilters) {
    input.checked = false;
  }

  renderTable(state.visibleNodes, state.visibleLinks);
}

function renderDependencyItem(item) {
  const metadata = state.portageMetadata.get(normalizePath(item.file));
  const statusPrefix = formatDependencyStatusPrefix(metadata);

  return `
    <li>
      <button type="button" class="dependency-link" data-node-id="${escapeHtml(item.file)}">
        <span class="dependency-status-prefix">${escapeHtml(statusPrefix)}</span>${escapeHtml(item.label)}
      </button>
    </li>
  `;
}

function handleDetailsContentClick(event) {
  const target = event.target.closest(".dependency-link");
  if (!target) {
    return;
  }

  event.preventDefault();
  selectNodeById(target.dataset.nodeId, { pushHistory: true });
}

function selectNodeById(nodeId, options = {}) {
  const { pushHistory = false } = options;
  const targetNode = state.graphData?.graph?.nodes.find((node) => node.id === nodeId);
  if (!targetNode) {
    return;
  }

  if (pushHistory && state.selectedNode?.id && state.selectedNode.id !== nodeId) {
    state.detailsHistory.push({ kind: "node", id: state.selectedNode.id });
  }

  state.selectedNode = targetNode;
  state.selectedLink = null;
  renderDetailsForNode(targetNode);
  highlight(targetNode);
}

function navigateDetailsBack() {
  const previous = state.detailsHistory.pop();
  if (!previous) {
    return;
  }

  if (previous.kind === "node") {
    selectNodeById(previous.id, { pushHistory: false });
  }

  updateDetailsBackButton();
}

function updateDetailsBackButton() {
  detailsBackButton.disabled = state.detailsHistory.length === 0;
}

function portageStatusAppearance(nodeId) {
  const metadata = state.portageMetadata.get(normalizePath(nodeId));
  const porte = metadata?.porte ?? "";
  const aPorter = metadata?.aPorter ?? "";

  if (porte.includes("\u2705")) {
    return { fill: "#6aa87a", glyph: "\u2713" };
  }

  if (porte.includes("\u{1F7E0}") || aPorter.includes("\u{1F7E0}")) {
    return { fill: "#d88c33", glyph: "\u2026" };
  }

  if (aPorter.includes("\u26D4")) {
    return { fill: "#a9564d", glyph: "\u00D7" };
  }

  if (aPorter.includes("\u2705")) {
    return { fill: "#6aa87a", glyph: "\u2713" };
  }

  return { fill: "#b9afa4", glyph: "\u2022" };
}

function matchesGraphAporterFilter(node, filters) {
  if (filters.length === 0) {
    return true;
  }

  const metadata = state.portageMetadata.get(normalizePath(node.id));
  const value = (metadata?.aPorter ?? "").trim();
  return filters.includes(value || "__empty__");
}

function formatDependencyStatusPrefix(metadata) {
  return `${portageStatusEmoji(metadata)} `;
}

function portageStatusEmoji(metadata) {
  const porte = metadata?.porte?.trim() ?? "";

  if (porte.includes("\u2705")) {
    return "\u2705";
  }

  if (porte.includes("\u{1F7E0}")) {
    return "\u{1F7E0}";
  }

  return "\u26AA";
}

function loadColumnWidths() {
  try {
    const raw = localStorage.getItem(COLUMN_WIDTHS_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_COLUMN_WIDTHS };
    }

    const parsed = JSON.parse(raw);
    return { ...DEFAULT_COLUMN_WIDTHS, ...parsed };
  } catch {
    return { ...DEFAULT_COLUMN_WIDTHS };
  }
}

function saveColumnWidths() {
  try {
    localStorage.setItem(COLUMN_WIDTHS_STORAGE_KEY, JSON.stringify(state.columnWidths));
  } catch {
    // Ignore storage write failures.
  }
}

function applyColumnWidths() {
  for (let index = 0; index < tableColumns.length; index += 1) {
    const col = tableColumns[index];
    const key = col.dataset.colKey;
    const width = state.columnWidths[key] ?? DEFAULT_COLUMN_WIDTHS[key];
    const size = `${width}px`;

    col.style.width = size;
    col.style.minWidth = size;
    col.style.maxWidth = size;

    const headerCell = dependencyTable.querySelector(`thead th:nth-child(${index + 1})`);
    if (headerCell) {
      headerCell.style.width = size;
      headerCell.style.minWidth = size;
      headerCell.style.maxWidth = size;
    }

    const bodyCells = dependencyTable.querySelectorAll(`tbody td:nth-child(${index + 1})`);
    for (const cell of bodyCells) {
      cell.style.width = size;
      cell.style.minWidth = size;
      cell.style.maxWidth = size;
    }
  }
}

function startColumnResize(event) {
  event.preventDefault();
  event.stopPropagation();

  const key = event.currentTarget.dataset.colKey;
  const startX = event.clientX;
  const startWidth = state.columnWidths[key] ?? DEFAULT_COLUMN_WIDTHS[key] ?? 120;
  const minWidth = MIN_COLUMN_WIDTHS[key] ?? 72;

  tableWrap.classList.add("is-resizing");
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";

  const handleMove = (moveEvent) => {
    moveEvent.preventDefault();
    const delta = moveEvent.clientX - startX;
    state.columnWidths[key] = Math.max(minWidth, Math.round(startWidth + delta));
    applyColumnWidths();
  };

  const handleEnd = () => {
    tableWrap.classList.remove("is-resizing");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    saveColumnWidths();
    window.removeEventListener("mousemove", handleMove);
    window.removeEventListener("mouseup", handleEnd);
  };

  window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseup", handleEnd);
}
