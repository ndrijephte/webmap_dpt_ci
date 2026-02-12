const infoPanel = document.getElementById("info-panel");
console.log(infoPanel);

// Initialisation
var map = L.map("map").setView([7.5468545, -5.5470995], 9);

// Fond de carte par défaut
var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
});

// Autres fonds de carte
var Stadia_AlidadeSmoothDark = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
  {
    maxZoom: 20,
    attribution:
      "&copy; Stadia Maps, OpenMapTiles & OpenStreetMap contributors",
  },
).addTo(map);
var OpenStreetMap_Mapnik = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
);
var Thunderforest_OpenCycleMap = L.tileLayer(
  "https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=<YOUR_API_KEY>",
  {
    maxZoom: 22,
    attribution: "&copy; Thunderforest & OpenStreetMap contributors",
  },
);

// Fonds de carte
var baseLayers = {
  OpenStreetMap: osm,
  Mapnik: OpenStreetMap_Mapnik,
  "Stadia Dark": Stadia_AlidadeSmoothDark,
  "Thunderforest Cycle": Thunderforest_OpenCycleMap,
};

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// Création de groupes
var groupeLimite = L.layerGroup();
var groupeDepartements = L.layerGroup();

// Création du contrôleur de couches
// var layerControl = L.control
//   .layers(
//     baseLayers,
//     {
//       Limite: groupeLimite,
//       Département: groupeDepartements,
//     },
//     {
//       collapsed: true, l’utilisateur peut le ranger
//     },
//   )
//   .addTo(map);

// %%%%%%%%% POUR GENERER DYNAMIQUEMENT LES LISTES %%%%%%
function buildLayerPanel() {
  const basemapList = document.getElementById("basemap-list");
  const overlayList = document.getElementById("overlay-list");

  // --- FONDS DE CARTE (radio buttons) ---
  Object.entries(baseLayers).forEach(([name, layer], index) => {
    const id = "basemap-" + index;

    const label = document.createElement("label");

    label.innerHTML = `
      <input type="radio" name="basemap" id="${id}">
      ${name}
    `;

    basemapList.appendChild(label);

    label.querySelector("input").addEventListener("change", () => {
      // enlever tous les fonds
      Object.values(baseLayers).forEach((l) => map.removeLayer(l));

      map.addLayer(layer);
    });
  });

  // --- COUCHES (checkboxes) ---
  const overlays = {
    Limite: groupeLimite,
    Départements: groupeDepartements,
  };

  Object.entries(overlays).forEach(([name, layer], index) => {
    const id = "overlay-" + index;

    const label = document.createElement("label");

    label.innerHTML = `
      <input type="checkbox" id="${id}" checked>
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
document.querySelectorAll(".section-header").forEach((header) => {
  header.addEventListener("click", () => {
    const content = header.nextElementSibling;

    content.style.display =
      content.style.display === "block" ? "none" : "block";
  });
});

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

// Appel des fonctions
wfsMapLayerLimit();
wfsMapLayerDepartements();
buildLayerPanel();

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
