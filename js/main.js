// Create global variables so that the data doesn't need to be a parameter for each visualization
// allData is all of the data we can use
// filteredData is what has been selected through brushing

let allData,
  filteredSightings = [];
let leafletMap, timeline, barchart, piechart, heatMap, radarChart;
let removeUFOShapeSelection;

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

    updateVisualizations = (currentVis) => {
      // Update all of the visualizations' content
      leafletMap.updateVis();
      timeline.updateVis();
      barchart.updateVis();
      piechart.updateVis();
      heatMap.updateVis();
      radarChart.updateVis();
      
      // Remove the brushes from the visualizations
      timeline.brushG.call(timeline.brush.move, null);
      barchart.brushG.call(barchart.brush.move, null);
      // Clear the shape selection if that's not what was just updated
      if (currentVis != piechart) removeUFOShapeSelection();
      // Keep the brush if the currentVis is the heatmap
      if (currentVis != heatMap) heatMap.brushG.call(heatMap.brush.move, null);
      // TODO: add logic here to only remove the map brush if it's not the one that was just created
      // if (currentVis != leafletMap) {REMOVE THE BRUSH FROM THE MAP}
    };

    // Create the visualizations
    leafletMap = new LeafletMap({ parentElement: "#my-map" });
    timeline = new Timeline({ parentElement: "#timeline" });
    barchart = new Barchart({ parentElement: "#barchart" });
    piechart = new PieChart({ parentElement: "#piechart" });
    heatMap = new HeatmapChart({ parentElement: "#heatmap" });
    radarChart = new RadarChart({ parentElement: "#radarchart" });

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
  })
  .catch((error) => console.error(error));
