class LeafletMap {
  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
    };

    this.colorAttribute = "default";
    this.colorSchemes = {
      // Define color schemes for different attributes
      year: d3.scaleLinear(d3.interpolateTurbo).domain([1949, 2013]),
      month: d3.scaleOrdinal(d3.schemeCategory10),
      timeOfDay: d3
        .scaleOrdinal()
        .domain(["morning", "afternoon", "evening", "night"])
        .range(["yellow", "orange", "red", "navy"]),
      ufoShape: d3.scaleOrdinal(d3.schemeSet3),
      default: "steelblue",
    };
    this.brushEnabled = false;

    this.initVis();
  }

  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    //ESRI
    vis.esriUrl =
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    vis.esriAttr =
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";

    //TOPO
    vis.topoUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
    vis.topoAttr =
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';

    //Thunderforest Outdoors- requires key... so meh...
    vis.thOutUrl =
      "https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey={apikey}";
    vis.thOutAttr =
      '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    //Stamen Terrain
    vis.stUrl =
      "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.{ext}";
    vis.stAttr =
      '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    // Open street map
    vis.openStreetMapUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    vis.openStreetMapAttr =
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    // Esri Ocean Base
    vis.esriOceanBaseUrl =
      "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}";
    vis.esriOceanBaseAttr =
      "Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri";

    const dropdownOptions = [
      { value: "esri", label: "ESRI" },
      { value: "openStreetMap", label: "Open Street Map" },
      { value: "topo", label: "Topo" },
      { value: "esriOceanBase", label: "ESRI Ocean Base" },
      { value: "stamenTerrain", label: "Stamen Terrain" },
    ];

    // Dropdown for map backgrounds
    d3.select(vis.config.parentElement)
      .append("select")
      .attr("id", "map-background")
      .selectAll("option")
      .data(dropdownOptions)
      .enter()
      .append("option")
      .attr("value", (d) => d.value)
      .text((d) => d.label);

    d3.select("#map-background").on("change", function () {
      vis.changeMapBackground(this.value);
    });

    vis.base_layer = L.tileLayer(vis.esriUrl, {
      id: "terrian-image",
      attribution: vis.esriAttr,
      ext: "png",
    });

    vis.theMap = L.map("my-map", {
      center: [30, 0],
      zoom: 2,
      layers: [vis.base_layer],
    });

    //if you stopped here, you would just have a map

    //initialize svg for d3 to add to map
    L.svg({ clickable: true }).addTo(vis.theMap); // we have to make the svg layer clickable
    vis.overlay = d3.select(vis.theMap.getPanes().overlayPane);
    vis.svg = vis.overlay.select("svg").attr("pointer-events", "auto");

    const colorByOptions = [
      { value: "default", label: "Single Color" },
      { value: "year", label: "Color by Year" },
      { value: "month", label: "Color by Month" },
      { value: "timeOfDay", label: "Color by Time of Day" },
      { value: "ufoShape", label: "Color by UFO Shape" },
    ];

    d3.select(vis.config.parentElement)
      .append("select")
      .attr("id", "color-by-option")
      .selectAll("option")
      .data(colorByOptions)
      .enter()
      .append("option")
      .attr("value", (d) => d.value)
      .text((d) => d.label);

    d3.select("#color-by-option").on("change", function () {
      vis.colorAttribute = this.value;
      vis.updateVis(brushEnabled);
    });

    //handler here for updating the map, as you zoom in and out
    vis.theMap.on("zoomend", function () {
      vis.updateVis();
    });

    vis.brushG = vis.svg.append("g").attr("class", "brush");

    vis.brush = d3.brush()
      .extent([[0, 0], [vis.theMap.getSize().x, vis.theMap.getSize().y]])
      .on("start", () => (filteredSightings = [])) 
      .on("end", (event) => vis.filterBySelection(event, vis)); 

    vis.updateVis(vis.brushEnabled);
  }

  changeMapBackground(background) {
    let vis = this;
    // This removes the existing base layer
    vis.theMap.removeLayer(vis.base_layer);

    switch (background) {
      case "openStreetMap":
        vis.base_layer = L.tileLayer(vis.openStreetMapUrl, {
          id: "open-street-image",
          attribution: vis.openStreetMapAttr,
          ext: "png",
        });
        break;
      case "esri":
        vis.base_layer = L.tileLayer(vis.esriUrl, {
          id: "esri-image",
          attribution: vis.esriAttr,
          ext: "png",
        });
        break;
      case "topo":
        vis.base_layer = L.tileLayer(vis.topoUrl, {
          id: "topo-image",
          attribution: vis.topoAttr,
          ext: "png",
        });
        break;
      case "esriOceanBase":
        vis.base_layer = L.tileLayer(vis.esriOceanBaseUrl, {
          id: "esri-ocean-base-image",
          attribution: vis.esriOceanBaseAttr,
          ext: "png",
        });
        break;
      case "stamenTerrain":
        vis.base_layer = L.tileLayer(vis.stUrl, {
          id: "terrian-image",
          attribution: vis.stAttr,
          ext: "png",
        });
        break;
      default:
        console.error("Map background error");
        return;
    }
    vis.base_layer.addTo(vis.theMap);
  }

  updateVis(brushEnabled) {
    let vis = this;

    // TODO: for some reason when the map is zoomed or the color scheme changes, filteredSightings changes to []
    // I have absolutely no idea why this is happening, as it doesn't happen any other time the map or data changes
    // It's causing all of the points to show on the map instead of just the filtered ones -- Emma
    console.log(filteredSightings);

    // Only include brushed data, if applicable
    // Otherwise, include everything in allData
    vis.data = allData.filter(
      (d) =>
        filteredSightings.length == 0 ||
        (filteredSightings.length != 0 &&
          filteredSightings.find(
            (filteredSighting) => filteredSighting == d.id
          ))
    );

    //these are the city locations, displayed as a set of dots
    vis.Dots = vis.svg
      .selectAll("circle.mapPoint")
      .data(vis.data)
      .join("circle")
      .attr("class", "mapPoint")
      // Hide the dots that aren't selected, if any visualization was brushed
      .style("display", (d) =>
        filteredSightings.length == 0 ||
        filteredSightings.some((sightingID) => sightingID == d.id)
          ? "inline"
          : "none"
      )
      .attr("fill", (d) => vis.determineFill(d))
      .attr("stroke", "black")
      //Leaflet has to take control of projecting points. Here we are feeding the latitude and longitude coordinates to
      //leaflet so that it can project them on the coordinates of the view. Notice, we have to reverse lat and lon.
      //Finally, the returned conversion produces an x and y point. We have to select the the desired one using .x or .y
      .attr(
        "cx",
        (d) => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).x
      )
      .attr(
        "cy",
        (d) => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).y
      )
      .attr("r", 3)
      .on("mouseover", function (event, d) {
        // Function to add mouseover event
        d3.select(this)
          .transition() // D3 selects the object we have moused over to perform operations on it
          .duration("150") // How long we are transitioning between the two states (works like keyframes)
          .attr("r", 10); // Change radius

        tooltip.style("visibility", "visible").html(`
          <div class="tooltip-content">
          <div class="tooltip-title">${
            d.city_area
          }${d.state !== "NA" ? ", " + d.state : ""}</div>
            <div><b>Date/Time</b>: ${d.date_time}</div>
            <div><b>Coordinates</b>: (${d.latitude}, ${d.longitude})</div>
            <div><b>Shape</b>: ${d.ufo_shape}</div>
            <div><b>Encounter time length</b>: ${
              d.described_encounter_length
            } (${d.encounter_length} seconds)</div>
            <div><b>Description</b>: ${d.description}</div>
          </div>`);
      })
      .on("mousemove", (event) => {
        // Position the tooltip
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseleave", function () {
        // Function to add mouseover event
        d3.select(this)
          .transition() // D3 selects the object we have moused over to perform operations on it
          .duration("150") // How long we are transitioning between the two states (works like keyframes)
          .attr("r", 3); // Change radius

        tooltip.style("visibility", "hidden"); // Turn off the tooltip
      })
      .on("click", (event, d) => {
        //experimental feature I was trying- click on point and then fly to it
        // vis.newZoom = vis.theMap.getZoom()+2;
        // if( vis.newZoom > 18)
        //  vis.newZoom = 18;
        // vis.theMap.flyTo([d.latitude, d.longitude], vis.newZoom);
      });

    //want to see how zoomed in you are?
    // console.log(vis.map.getZoom()); //how zoomed am I

    //want to control the size of the radius to be a certain number of meters?
    vis.radiusSize = 3;

    // if( vis.theMap.getZoom > 15 ){
    //   metresPerPixel = 40075016.686 * Math.abs(Math.cos(map.getCenter().lat * Math.PI/180)) / Math.pow(2, map.getZoom()+8);
    //   desiredMetersForPoint = 100; //or the uncertainty measure... =)
    //   radiusSize = desiredMetersForPoint / metresPerPixel;
    // }

    //redraw based on new zoom- need to recalculate on-screen position
    vis.Dots.attr(
      "cx",
      (d) => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).x
    )
      .attr(
        "cy",
        (d) => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).y
      )
      .attr("r", vis.radiusSize);

      if (brushEnabled === true) {
        vis.theMap.dragging.disable();
        vis.svg.select(".brush").remove();
        vis.svg.append("g")
            .attr("class", "brush")
            .call(vis.brush);
        vis.brushEnabled = true;
    } else if (brushEnabled === false){
        vis.theMap.dragging.enable();
        vis.svg.select(".brush").remove(); 
        vis.brushEnabled = false;
    }
      vis.brushG.call(vis.brush);
  }

  filterBySelection = function(event, vis) {
    if (!event.selection)  return;
    const extent = event.selection;
        // If there's no selection, reset the visualization to show all sightings
    if (!extent) {
      // Reset the filter (include them all)
      filteredSightings = [];
    } else {
    let selection = event.selection;
    let bounds = L.latLngBounds(
        vis.theMap.layerPointToLatLng([extent[0][0], extent[0][1]]),
        vis.theMap.layerPointToLatLng([extent[1][0], extent[1][1]])
    );

    // Filter sightings within the bounds
    filteredSightings = allData.filter(d =>
        bounds.contains([d.latitude, d.longitude])
    ).map(d => d.id);
}

    // After filtering, update all visualizations accordingly
    updateVisualizations(vis);
};

  determineFill(d) {
    const vis = this;

    if (vis.colorAttribute !== "default") {
      // Sets the color scale based on dropdown value selected
      let colorScale;
      switch (vis.colorAttribute) {
        case "default":
          return "steelblue";
        case "year":
          colorScale = d3
            .scaleOrdinal()
            .domain([
              "1900s",
              "1910s",
              "1920s",
              "1930s",
              "1940s",
              "1950s",
              "1960s",
              "1970s",
              "1980s",
              "1990s",
              "2000s",
              "2010s",
            ])
            .range([
              "#9a649c",
              "#8f5f98",
              "#845993",
              "#79448e",
              "#6f3f8a",
              "#643a85",
              "#59357f",
              "#4e307a",
              "#432b75",
              "#38266f",
              "#2d216a",
              "#4a024d",
            ]);

          const year = new Date(d.date_time).getFullYear();
          const decade = Math.floor(year / 10) * 10;
          return colorScale(decade + "s");

        case "month":
          colorScale = d3
            .scaleOrdinal()
            .domain([
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ])
            .range([
              "red",
              "orange",
              "yellow",
              "green",
              "blue",
              "indigo",
              "violet",
              "purple",
              "pink",
              "brown",
              "grey",
              "white",
            ]);
          const month = new Date(d.date_time).getMonth();
          return colorScale(
            [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ][month]
          );

        case "timeOfDay":
          colorScale = d3
            .scaleOrdinal()
            .domain(["morning", "afternoon", "evening", "night"])
            .range(["yellow", "orange", "red", "navy"]);
          const hour = new Date(d.date_time).getHours();
          if ((hour >= 20 && hour < 24) || (hour >= 0 && hour < 6))
            return colorScale("night");
          else if (hour >= 6 && hour < 12) return colorScale("morning");
          else if (hour >= 12 && hour < 16) return colorScale("afternoon");
          else if (hour >= 16 && hour < 20) return colorScale("evening");
          else return "steelblue";
        case "ufoShape":
          colorScale = d3
            .scaleOrdinal()
            .domain([
              "changing",
              "chevron",
              "cigar",
              "circle",
              "cone",
              "crescent",
              "cross",
              "cylinder",
              "delta",
              "diamond",
              "disk",
              "dome",
              "egg",
              "fireball",
              "flare",
              "flash",
              "formation",
              "hexagon",
              "light",
              "NA",
              "other",
              "oval",
              "pyramid",
              "rectangle",
              "round",
              "sphere",
              "teardrop",
              "triangle",
              "unknown",
              "(blank)",
            ])
            .range([
              "red",
              "blue",
              "aqua",
              "green",
              "yellow",
              "purple",
              "orange",
              "pink",
              "turquoise",
              "lavender",
              "cyan",
              "magenta",
              "lime",
              "teal",
              "maroon",
              "olive",
              "navy",
              "indigo",
              "coral",
              "slate",
              "violet",
              "salmon",
              "tan",
              "skyblue",
              "mintcream",
              "peachpuff",
              "rosybrown",
              "indianred",
              "gold",
              "ivory",
            ]);
          return colorScale(d.ufo_shape);
        default:
          return vis.colorSchemes.default;
      }
    } else {
      return vis.colorSchemes.default;
    }
  }
}
