var uniqueIdCounter = 0;
var nodeRegistry = new Map();
var edgeRegistry = new Map();
var clusterColors = new Map(); // cluster identifier → visual hex/hsl string

//  Data sanitation helper (Generates safe system identifiers)
function sanitizeIdentifier(name) {
  return (name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")       // Remove accents
    .replace(/[^a-zA-Z0-9]+/g, " ")        // Replace non-alphanumerics with spaces
    .trim()
    .split(/\s+/)                          // Split into individual words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");                             // Join tokens together
}

//  Generates highly distinct visual markers for variable groups
function generateSystemColor() {
  let hue = Math.floor(Math.random() * 360);
  let saturation = 70 + Math.random() * 20;
  let lightness = 60 + Math.random() * 15;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

//  Integrates the workspace menu into the UI wrapper
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Network Export Engine')
    .addItem('Export Graph Topology (JS)', 'generateGraphData')
    .addItem('Validate Schema Rows', 'verifyDataCompleteness')
    .addToUi();
}

//  Main parser function mapping rows to nodes and cross-sections to edges
function generateGraphData() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var spreadsheetMatrix = sheet.getDataRange().getValues();

  // Reset internal memory blocks
  uniqueIdCounter = 0;
  nodeRegistry = new Map();
  edgeRegistry = new Map();
  clusterColors = new Map();

  // Phase 1: Ingest primary Nodes from Matrix (Col A = Node Label, Col B = Cluster Group, Col C = Classification Subgroup)
  for (let row = 1; row < spreadsheetMatrix.length; row++) {
    let sourceLabel = (spreadsheetMatrix[row][0] || "").trim(); 
    let clusterGroup = (spreadsheetMatrix[row][1] || "").trim();    
    let classification = (spreadsheetMatrix[row][2] || "").trim();   
    if (!sourceLabel) continue;

    let safeSystemId = sanitizeIdentifier(sourceLabel);
    let assetUri = safeSystemId || "default_node";
    assetUri = "assets/" + assetUri + ".png"; // Universal data pointer path

    registerNode(sourceLabel, clusterGroup, classification, assetUri, safeSystemId);
  }

  // Phase 2: Structural Link Discovery → Maps target parameters starting at Column D (Index 3)
  for (let row = 1; row < spreadsheetMatrix.length; row++) {
    let rootNodeLabel = (spreadsheetMatrix[row][0] || "").trim();
    let rootNodeInstance = nodeRegistry.get(rootNodeLabel);

    if (!rootNodeInstance) {
      let safeSystemId = sanitizeIdentifier(rootNodeLabel);
      rootNodeInstance = Array.from(nodeRegistry.values())
        .find(n => n.safeSystemId === safeSystemId);
    }
    if (!rootNodeInstance) continue;

    for (let col = 3; col < spreadsheetMatrix[row].length; col++) { 
      let relationLabel = spreadsheetMatrix[0][col];
      let interfaceColor = sheet.getRange(1, col + 1).getBackground().replace('#', '');
      let structuralCellRaw = (spreadsheetMatrix[row][col] || "").trim();
      
      parseEdges(rootNodeInstance, structuralCellRaw, "#" + interfaceColor, relationLabel);
    }
  }

  let nodes = compileNodesArray(nodeRegistry.entries());
  let edges = compileEdgesArray(edgeRegistry.entries());

  Logger.log("Serialization Complete: Generated " + nodes.length + " relational nodes, " + edges.length + " directional edges.");

  let serializedPayload = "window.graphData = " + JSON.stringify({ nodes, edges }, null, 2) + ";";
  renderOutputDialog(serializedPayload);
}

//  Extracts comma-delimited strings to produce discrete edge connections
function parseEdges(sourceNode, rawCellCsv, edgeHexColor, edgeContextLabel) {
  if (!rawCellCsv || rawCellCsv === "-") return;

  let originId = sourceNode.id;
  let targetedLinks = rawCellCsv.split(",");

  for (let targetLabel of targetedLinks) {
    let exactTargetName = targetLabel.trim();
    if (!exactTargetName) continue;

    let safeSystemId = sanitizeIdentifier(exactTargetName);
    let assetUri = "assets/" + (safeSystemId || "default_node") + ".png";

    // Unregistered downstream nodes safely fallback to 'unclustered'
    let terminalNodeInstance = registerNode(exactTargetName, "unclustered", "", assetUri, safeSystemId);
    let terminalId = terminalNodeInstance.id;

    let vectorAB = originId + "to" + terminalId;
    let vectorBA = terminalId + "to" + originId;

    // Normalization mechanism guarantees directionless/bi-directional edge parity
    let unifiedEdgeKey = vectorAB < vectorBA ? vectorAB : vectorBA;

    if (!edgeRegistry.has(unifiedEdgeKey)) {
      let edgeMetadataBlock = {
        from: originId.toString(),
        to: terminalId.toString(),
        color: edgeHexColor,
        label: edgeContextLabel,
        weight: 1
      };
      edgeRegistry.set(unifiedEdgeKey, edgeMetadataBlock);
    } else {
      let existingEdge = edgeRegistry.get(unifiedEdgeKey);
      existingEdge.weight++;
      edgeRegistry.set(unifiedEdgeKey, existingEdge);
    }

    // Boost weights relative to visual node magnitude calculations
    sourceNode.magnitudeValue++;
    terminalNodeInstance.magnitudeValue++;
  }
}

//  Transforms internal raw Maps into graph-consumable arrays
function compileEdgesArray(mapEntries) {
  return Array.from(mapEntries, ([, data]) => ({
    from: data.from,
    to: data.to,
    label: data.label,
    color: data.color,
    width: data.weight || 1
  }));
}

function compileNodesArray(mapEntries) {
  return Array.from(mapEntries, ([, data]) => ({
    id: data.id.toString(),
    label: data.label,
    group: data.cluster,
    subgroup: data.classification || "",
    shape: "circularImage",
    value: Math.max(10, Math.min(100, Math.pow(2 * data.magnitudeValue, 2))),
    image: data.imagePath,
    brokenImage: "assets/default_node.png",
    color: data.styleColors,
    font: { color: "#000", size: 16 }
  }));
}

//  Thread-safe data insertion controller logic
function registerNode(primaryName, clusterGroup, classification, resourceUri, safeSystemId) {
  if (nodeRegistry.has(primaryName)) {
    return nodeRegistry.get(primaryName);
  }

  if (!clusterGroup) clusterGroup = "unclustered";

  let visualHexMarker;
  if (clusterColors.has(clusterGroup)) {
    visualHexMarker = clusterColors.get(clusterGroup);
  } else {
    visualHexMarker = generateSystemColor();
    clusterColors.set(clusterGroup, visualHexMarker);
  }

  let structuredNodeObject = {
    id: uniqueIdCounter,
    label: primaryName,
    cluster: clusterGroup,
    classification: classification || "",
    shape: "circularImage",
    imagePath: resourceUri,
    magnitudeValue: 1,
    safeSystemId: safeSystemId || "",
    styleColors: { background: visualHexMarker, border: visualHexMarker }
  };

  nodeRegistry.set(primaryName, structuredNodeObject);
  uniqueIdCounter++;
  return structuredNodeObject;
}

// UI Engine interaction layer displaying modals
function renderOutputDialog(rawOutputString) {
  var userInterfaceContainer = HtmlService.createHtmlOutput(
    "<textarea style='width:100%; font-family:monospace;' rows='20'>" + rawOutputString + "</textarea>"
  );
  userInterfaceContainer.setWidth(600).setHeight(450);
  SpreadsheetApp.getUi().showModalDialog(userInterfaceContainer, 'Graph Stream Assembly');
}

//  Audits index matrices to flag reference dependencies missing a structural row mapping
function verifyDataCompleteness() {
  let structuredDeclarations = [];
  let orphanReferences = new Map();

  let sheet = SpreadsheetApp.getActiveSheet();
  let matrix = sheet.getDataRange().getValues();

  for (let row = 1; row < matrix.length; row++) {
    let coreNodeName = (matrix[row][0] || "").trim();
    if (coreNodeName) structuredDeclarations.push(coreNodeName);
  }

  for (let row = 1; row < matrix.length; row++) {
    for (let col = 3; col < matrix[row].length; col++) {
      let arrayValueString = (matrix[row][col] || "").trim();
      if (arrayValueString !== "-" && arrayValueString !== "") {
        let extractedLinks = arrayValueString.split(",");
        for (let entry of extractedLinks) {
          let checkedTarget = entry.trim();
          if (checkedTarget && !structuredDeclarations.includes(checkedTarget)) {
            let safeSystemId = sanitizeIdentifier(checkedTarget);
            orphanReferences.set(checkedTarget, safeSystemId);
          }
        }
      }
    }
  }

  let diagnosticReport;
  if (orphanReferences.size === 0) {
    diagnosticReport = "Structural Integrality Maintained: No structural omissions discovered.";
  } else {
    diagnosticReport = "Schema Violation: Detected referenced elements missing definitive row properties:\n\n";
    for (let [unmappedLabel, safeSystemId] of orphanReferences.entries()) {
      diagnosticReport += `- ${unmappedLabel} $\rightarrow$ assets/${safeSystemId || "default_node"}.png\n`;
    }
  }
  renderOutputDialog(diagnosticReport);
}