const infoPanel = document.getElementById("info-panel");
console.log(infoPanel);

// Initialisation
var map = L.map("map").setView([7.5468545, -5.5470995], 9);

// ------------------------------------------------------
// %%%%%%%% Fond de carte par défaut %%%%%%%%%%
// 1/ OpenStreetMap
var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
});

// 2/ Stadia_AlidadeSmoothDark
var Stadia_AlidadeSmoothDark = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
  {
    maxZoom: 20,
    attribution:
      "&copy; Stadia Maps, OpenMapTiles & OpenStreetMap contributors",
  },
);

// 3/ Stadia_AlidadeSatellite
var Stadia_AlidadeSatellite = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}",
  {
    minZoom: 0,
    maxZoom: 20,
    attribution:
      '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: "jpg",
  },
);

// 4/ Stadia_StamenTonerLite
var Stadia_StamenTonerLite = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.{ext}",
  {
    minZoom: 0,
    maxZoom: 20,
    attribution:
      '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: "png",
  },
);

// 5/ OpenTopo
var OpenTopoMap = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 17,
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  },
);

// 6/ Stadia AlidadeSmooth
var Stadia_AlidadeSmooth = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}",
  {
    minZoom: 0,
    maxZoom: 20,
    attribution:
      '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: "png",
  },
).addTo(map);

// %%%% Fonds de carte %%%%%
var baseMaps = {
  OpenStreetMap: {
    layer: osm,
    img: "assets/img/osm.png",
  },
  "Stadia Dark": {
    layer: Stadia_AlidadeSmoothDark, // Correction ici : variable, pas "string"
    img: "assets/img/stadia_dark.png",
  },
  "Stadia Satellite": {
    layer: Stadia_AlidadeSatellite,
    img: "assets/img/stadia_satellite.png",
  },
  "Stamen Toner Lite": {
    layer: Stadia_StamenTonerLite,
    img: "assets/img/stament_toner.png",
  },
  OpenTopoMap: {
    layer: OpenTopoMap,
    img: "assets/img/open_topo.png",
  },
  "Stadia Smooth": {
    layer: Stadia_AlidadeSmooth,
    img: "assets/img/stadia_smooth.png",
  },
};

let currentBaseLayer = Stadia_AlidadeSmooth; // On définit la couche par défaut

// ---------------------------------------------------------------------

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// Création de groupes
var groupeLimite = L.layerGroup();
var groupeDepartements = L.layerGroup();

// Définition des overlays GLOBALE
const overlays = {
  Limite: {
    layer: groupeLimite,
    type: "line",
  },
  Départements: {
    layer: groupeDepartements,
    type: "polygon",
  },
};

// %%%%%%%%% GENERATION DYNAMIQUE DE CONTENU %%%%%%%%%%
const managerContent = document.getElementById("manager-content");

function renderOverlays() {
  managerContent.innerHTML = "";

  Object.entries(overlays).forEach(([name, obj]) => {
    const label = document.createElement("label");

    let symbol = "";

    if (obj.type === "line") {
      symbol = `<span class="symbol line"></span>`;
    } else if (obj.type === "polygon") {
      symbol = `<span class="symbol polygon"></span>`;
    }

    label.innerHTML = `
      <input type="checkbox" checked>
      ${symbol}
      ${name}
    `;

    managerContent.appendChild(label);

    map.addLayer(obj.layer);

    label.querySelector("input").addEventListener("change", (e) => {
      if (e.target.checked) {
        map.addLayer(obj.layer);
      } else {
        map.removeLayer(obj.layer);
      }
    });
  });
}

// 2. CORRECTION de la fonction de rendu
function renderBasemaps() {
  managerContent.innerHTML = "";

  const grid = document.createElement("div");
  grid.classList.add("basemap-grid");

  Object.entries(baseMaps).forEach(([name, obj], index) => {
    const item = document.createElement("div");
    item.classList.add("basemap-item");

    // On vérifie si c'est la couche actuellement active pour cocher le radio
    const isChecked = obj.layer === currentBaseLayer ? "checked" : "";

    item.innerHTML = `
  <input type="radio" name="basemap" id="bm-${index}" ${isChecked}>
  <label for="bm-${index}">
    <img src="${obj.img}" alt="${name}"> <span>${name}</span>
  </label>
`;

    grid.appendChild(item);

    const radio = item.querySelector("input");

    radio.addEventListener("change", () => {
      if (radio.checked) {
        // Suppression de l'ancienne couche
        if (currentBaseLayer) {
          map.removeLayer(currentBaseLayer);
        }

        // Ajout de la nouvelle couche
        currentBaseLayer = obj.layer;
        map.addLayer(currentBaseLayer);
      }
    });
  });

  managerContent.appendChild(grid);
}

// ==========================================
// ----------- GESTION DES ONGLETS ------------
// ==========================================
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));

    tab.classList.add("active");

    const type = tab.dataset.tab;

    if (type === "overlays") {
      renderOverlays();
    } else {
      renderBasemaps();
    }
  });
});

// GESTION  DES ONGLETS OUVERTURE / FERMETURE
const manager = document.getElementById("layer-manager");
const toggleBtn = document.getElementById("manager-toggle");
const toggleIcon = toggleBtn.querySelector("i");

// état initial
manager.classList.add("collapsed");

toggleBtn.addEventListener("click", () => {
  manager.classList.toggle("collapsed");

  if (manager.classList.contains("collapsed")) {
    toggleIcon.classList.remove("fa-xmark");
    toggleIcon.classList.add("fa-bars");
  } else {
    toggleIcon.classList.remove("fa-bars");
    toggleIcon.classList.add("fa-xmark");
  }
});

// %%%%%%%%% POUR GENERER DYNAMIQUEMENT LES LISTES %%%%%%
function buildLayerPanel() {
  const basemapList = document.getElementById("basemaps-control");
  const overlayList = document.getElementById("layers-control");

  // Nettoyer avant génération
  basemapList.innerHTML = "";
  overlayList.innerHTML = "";

  // ========================
  // FONDS DE CARTE (radio)
  // ========================
  Object.entries(baseMaps).forEach(([name, layer], index) => {
    const label = document.createElement("label");

    label.innerHTML = `
      <input type="radio" name="basemap" ${index === 0 ? "checked" : ""}>
      ${name}
    `;

    basemapList.appendChild(label);

    if (index === 0) map.addLayer(layer);

    label.querySelector("input").addEventListener("change", () => {
      Object.values(baseMaps).forEach((l) => map.removeLayer(l));
      map.addLayer(layer);
    });
  });

  // ========================
  // COUCHES (checkbox)
  // ========================
  Object.entries(overlays).forEach(([name, layer]) => {
    const label = document.createElement("label");

    label.innerHTML = `
      <input type="checkbox" checked>
      ${name}
    `;

    overlayList.appendChild(label);

    map.addLayer(layer);

    label.querySelector("input").addEventListener("change", (e) => {
      if (e.target.checked) {
        map.addLayer(layer);
      } else {
        map.removeLayer(layer);
      }
    });
  });
}

// %%%%%% Activer l’ouverture / fermeture au clic %%%%%%
document.querySelectorAll(".control-header").forEach((header) => {
  header.addEventListener("click", () => {
    const content = header.nextElementSibling;
    const isOpen = content.style.display === "block";

    // Reset tout
    document.querySelectorAll(".control-content").forEach((panel) => {
      panel.style.display = "none";
    });

    document.querySelectorAll(".control-header").forEach((h) => {
      h.classList.remove("active");
    });

    if (!isOpen) {
      content.style.display = "block";
      header.classList.add("active");
    }
  });
});

// %%%%% CARTE CHLOROPLETE AVEC LES DONNEES DE POPULATION %%%%%%
// 1) Définition des classes de couleurs
const classesPopulation = [
  { min: 0, max: 300000, color: "#edf8fb", label: "< 300 000" },
  { min: 300000, max: 600000, color: "#abdda4", label: "300 000 – 600 000" },
  { min: 600000, max: 900000, color: "#ffffbf", label: "600 000 – 900 000" },
  { min: 900000, max: 1200000, color: "#fdae61", label: "900 000 – 1 200 000" },
  { min: 1200000, max: Infinity, color: "#d7191c", label: "> 1 200 000" },
];

// 2) Création de la fonction couleur
function getColor(pop) {
  return classesPopulation.find((c) => pop >= c.min && pop < c.max).color;
}

// Limites de la Côte d'Ivoire
function wfsMapLayerLimit() {
  fetch(
    "http://localhost:8080/geoserver/ci_map/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ci_map%3Alimite_ci&outputFormat=application%2Fjson&maxFeatures=1",
  )
    .then((res) => res.json())
    .then((data) => {
      const limitLayer = L.geoJSON(data, {
        style: {
          color: "#000000",
          weight: 3,
        },
      });

      groupeLimite.addLayer(limitLayer);
    });
}

// %%%%%%%% STYLE AU DEPLACEMENT SUR UN DPT DONNES %%%%%%%%%%%
// style normal
function styleDepartements(feature) {
  return {
    fill: true,
    fillColor: getColor(feature.properties.population),
    weight: 1,
    color: "#555",
    fillOpacity: 1,
  };
}

// style au survol
function highlightFeature(e) {
  const layer = e.target;

  layer.setStyle({
    fillColor: "#b4e9fd", // visible
    fillOpacity: 1,
    // color: "#000000",
    // weight: 1,
  });

  layer.bringToFront();
}

// retour au style initial
function resetHighlight(e) {
  departementsLayer.resetStyle(e.target);
}

let departementsLayer;
// const titre = document.querySelector("h1");

// Département de la Côte d'Ivoire
function wfsMapLayerDepartements() {
  fetch(
    "http://localhost:8080/geoserver/ci_map/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ci_map%3Adpt_ci&outputFormat=application%2Fjson&maxFeatures=108",
  )
    .then((res) => res.json())
    .then((data) => {
      departementsLayer = L.geoJSON(data, {
        style: styleDepartements,

        onEachFeature: function (feature, layer) {
          layer.on({
            mouseover: function (e) {
              highlightFeature(e);
              updateInfo(feature);
            },
            mouseout: function (e) {
              resetHighlight(e);
              infoPanel.innerHTML = `
      <h2>Informations</h2>
      <p>Survolez un département</p>
    `;
            },
          });
          // Poppup
          // layer.bindPopup(`
          //   <b>Département :</b> ${feature.properties.departement}<br>
          //   <b>Population :</b> ${(feature.properties.population || 0).toLocaleString()}
          // `);
        },
      });

      groupeDepartements.addLayer(departementsLayer);
      map.fitBounds(departementsLayer.getBounds());
    })
    .catch((err) => console.error("Erreur WFS :", err));
}

// Ajout de couche de contrôle
new L.Control.Geocoder().addTo(map);

// 3) Création la légende Leaflet
const legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
  const div = L.DomUtil.create("div", "legend");

  div.innerHTML = "<h4>Population</h4>";

  classesPopulation.forEach((c) => {
    div.innerHTML += `
      <div>
        <span style="
          background:${c.color};
          width:18px;
          height:18px;
          display:inline-block;
          margin-right:8px;
        "></span>
        ${c.label}
      </div>
    `;
  });

  return div;
};

legend.addTo(map);

// Mettre à jour les panneaux / Création du résumé des informations
function updateInfo(feature) {
  const props = feature.properties;

  infoPanel.innerHTML = `
    <h2>${props.departement}</h2>
    <p><b>Région :</b> ${props.region}</p>
    <p><b>Population :</b> ${(props.population || 0).toLocaleString()}</p>
    <p><b>Superficie :</b> ${(props.superficie * 0.0001).toFixed(3) || "N/A"} km²</p>
    <p><b>Densité :</b> ${(props.population / props.superficie).toFixed(3) || "N/A"} hbts/km²</p>
  `;
}

// %%%%%%%%%% Appel des fonctions %%%%%%%%%%%
wfsMapLayerLimit();
wfsMapLayerDepartements();
renderOverlays(); // affichage par défaut
