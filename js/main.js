// Create global variables so that the data doesn't need to be a parameter for each visualization
// allData is all of the data we can use
// filteredData is what has been selected through brushing

let allData,
  filteredSightings = [];
let leafletMap, timeline, barchart, piechart, heatMap, radarChart;

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
      // radarChart.updateVis();

      // Remove the brushes from the visualizations
      // leafletMap.brushG.call(leafletMap.brush.move, null);
      timeline.brushG.call(timeline.brush.move, null);
      barchart.brushG.call(barchart.brush.move, null);
      // Keep the brush if the currentVis is piechart, heatmap, or radarchart (only keep on that vis)
      // if (currentVis != piechart)
      //   piechart.brushG.call(piechart.brush.move, null);
      if (currentVis != heatMap) heatMap.brushG.call(heatMap.brush.move, null);
      // if (currentVis != radarChart)
      //   radarChart.brushG.call(radarChart.brush.move, null);
    };

    // Create the visualizations
    leafletMap = new LeafletMap({ parentElement: "#my-map" }, allData);
    timeline = new Timeline({ parentElement: "#timeline" });
    barchart = new Barchart({ parentElement: "#barchart" });
    piechart = new PieChart({ parentElement: "#piechart" });
    heatMap = new HeatmapChart({ parentElement: "#heatmap" });
    radarChart = new RadarChart({ parentElement: "#radarchart" });
  })
  .catch((error) => console.error(error));
