// Create global variables so that the data doesn't need to be a parameter for each visualization
// allData is all of the data we can use
// filteredData is what has been selected through brushing

let allData,
  filteredSightings = [];
let leafletMap, timeline, barchart, piechart, heatMap, radarChart;
let removeUFOShapeSelection, removeRadarSelection, removeSearchQuery;
let brushEnabled = false;

// Create the tooltip for easy access from the map and timeline
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("visibility", "hidden");

// Load the data from the CSV file
d3.csv("data/ufo_sightings.csv")
  .then((data) => {
    let noCoordinatesCount = 0;
    allData = data
      .map((d, index) => {
        // check that the latitude and longitude exist for plotting
        if (d.latitude !== "NA" && d.longitude !== "NA") {
          d.id = index; // Give the sighting an ID
          d.latitude = +d.latitude; //make sure these are not strings
          d.longitude = +d.longitude; //make sure these are not strings
          d.date_time = new Date(d.date_time); // Create a Date object from the string
          d.ufo_shape = d.ufo_shape == "NA" ? "unknown" : d.ufo_shape;
          return d; // return the data
        } else {
          // Either lat or long does not exist so increment the count
          noCoordinatesCount++;
          return null;
        }
      })
      .filter((d) => d !== null);

    d3.select("#noCoordinatesCount").text(
      `Unmapped sightings: ${noCoordinatesCount}`
    );

    d3.selectAll("#toggle-brush-button").on('click', function() {
      if (brushEnabled === false){
        leafletMap.updateVis(true);
        brushEnabled = true;
      } else if (brushEnabled === true) {
        leafletMap.updateVis(false);
        brushEnabled = false;
        updateVisualizations(leafletMap)
      }
    })


    updateVisualizations = (currentVis) => {
      // Update all of the visualizations' content
      leafletMap.updateVis(brushEnabled);
      timeline.updateVis();
      barchart.updateVis();
      piechart.updateVis();
      heatMap.updateVis();
      radarChart.updateVis();

      // Remove the brushes from the visualizations
      timeline.brushG.call(timeline.brush.move, null);
      barchart.brushG.call(barchart.brush.move, null);
      // Clear the shape selection if that's not what was just brushed
      if (currentVis != piechart) removeUFOShapeSelection();
      // Clear the radar chart select if that's not what was just brushed
      if (currentVis != radarChart) removeRadarSelection();
      // Clear the search input if that's not what was changed
      if (currentVis != "interactiveSearch") removeSearchQuery();
      // Keep the brush if the currentVis is the heatmap
      if (currentVis != heatMap) heatMap.brushG.call(heatMap.brush.move, null);
      // TODO: add logic here to only remove the map brush if it's not the one that was just created
      leafletMap.brush.call(leafletMap.brush.move, null);
    };

    // Create the visualizations
    leafletMap = new LeafletMap({ parentElement: "#my-map" });
    timeline = new Timeline({ parentElement: "#timeline" });
    barchart = new Barchart({ parentElement: "#barchart" });
    piechart = new PieChart({ parentElement: "#piechart" });
    heatMap = new HeatmapChart({ parentElement: "#heatmap" });
    radarChart = new RadarChart({ parentElement: "#radarchart" });

    // Interactive search logic...
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchBtn");
    const searchClearButton = document.getElementById("searchClearBtn");
    searchButton.onclick = () => {
      const searchValue = searchInput.value;
      if (searchValue != "") {
        filteredSightings = allData
          .filter((sighting) =>
            sighting.description
              .toLowerCase()
              .includes(searchValue.toLowerCase())
          )
          .map((sighting) => sighting.id);

        // Update all visualizations
        updateVisualizations("interactiveSearch");
      }
    };

    removeSearchQuery = () => {
      searchInput.value = "";
    };

    searchClearButton.onclick = () => {
      removeSearchQuery();
      filteredSightings = [];
      updateVisualizations("interactiveSearch");
    };

    // Pie chart selection logic...
    // Filter by UFO shape when any are selected in the dropdown
    // Get the HTML elements from the DOM
    const shapeSelect = document.getElementById("UFOShapes");
    const shapeSelectButton = document.getElementById("shapeFilterBtn");
    shapeSelectButton.onclick = () => {
      // Determine which values were selected
      const selectedValues = [...shapeSelect.options]
        .filter((x) => x.selected)
        .map((x) => x.value);

      if (selectedValues.length > 0) {
        // Filter the sightings by those that are of the selected shapes
        filteredSightings = allData
          .filter((sighting) => selectedValues.includes(sighting.ufo_shape))
          .map((sighting) => sighting.id);

        // Update all visualizations to only show the selected shapes
        updateVisualizations(piechart);
      }
    };

    removeUFOShapeSelection = () => {
      for (let i = 0; i < shapeSelect.length; i++) {
        shapeSelect[i].selected = false;
      }
    };

    // Remove the selected UFO shapes when the associated Clear button is clicked
    // Reset all visualizations
    document.getElementById("clearShapeFilterBtn").onclick = () => {
      removeUFOShapeSelection();
      filteredSightings = [];
      updateVisualizations(piechart);
    };

    // Radar selection logic...
    const radarStartInput = document.getElementById("radarStartInput");
    const radarEndInput = document.getElementById("radarEndInput");
    const radarFilterButton = document.getElementById("radarFilterBtn");
    const radarClearButton = document.getElementById("clearRadarFilterBtn");
    const radarError = document.getElementById("radarError");
    const radarEmptyError = document.getElementById("radarEmptyError");
    radarFilterButton.onclick = () => {
      // Determine which values were selected
      let selectedStart = radarStartInput.value;
      let selectedEnd = radarEndInput.value;

      // Only proceed if the start and end times were chosen
      if (selectedStart != "" && selectedEnd != "") {
        console.log(selectedStart, selectedEnd);
        // Hide the error message
        radarEmptyError.style.display = "none";

        // Convert the selections to integers
        selectedStart = +selectedStart;
        selectedEnd = +selectedEnd;

        if (selectedStart > selectedEnd) {
          // Show the error message
          radarError.style.display = "inline";
        } else {
          // Hide the error message
          radarError.style.display = "none";
          // Filter the sightings by those that are within the times
          filteredSightings = allData
            .filter((sighting) => {
              let sightingHour = sighting.date_time.getHours();
              if (sightingHour == 0) sightingHour = 24;
              return (
                sightingHour >= selectedStart && sightingHour <= selectedEnd
              );
            })
            .map((sighting) => sighting.id);

          // Update all visualizations to only show the selected times
          updateVisualizations(radarChart);
        }
      } else {
        // Show the error message
        radarEmptyError.style.display = "inline";
      }
    };

    removeRadarSelection = () => {
      radarStartInput.value = "";
      radarEndInput.value = "";
    };

    radarClearButton.onclick = () => {
      // Hide the error messages
      radarError.style.display = "none";
      radarEmptyError.style.display = "none";

      removeRadarSelection();
      filteredSightings = [];
      updateVisualizations(radarChart);
    };
  })
  .catch((error) => console.error(error));
