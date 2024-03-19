// Create global variables so that the data doesn't need to be a parameter for each visualization
// allData is all of the data we can use
// filteredData is what has been selected through brushing
let allData, filteredSightings = [];

// Create the tooltip for easy access from the map and timeline
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("visibility", "hidden");

// Load the data from the CSV file
d3.csv("data/ufo_sightings.csv")
  .then((data) => {
    allData = data.filter(
      (d) => d.latitude !== "NA" && d.longitude !== "NA"
    );
    //for some reason theres a data point (row 43784 in ufo_sightings) where the latitude doesn't exist
    //it prevents the data from loading on the map so i filtered it out
    allData.forEach((d, index) => {
      d.id = index; // Give the sighting an ID
      d.latitude = +d.latitude; //make sure these are not strings
      d.longitude = +d.longitude; //make sure these are not strings
      d.date_time = new Date(d.date_time); // Create a Date object from the string
    });

    // Initialize charts and show them
    leafletMap = new LeafletMap({ parentElement: "#my-map" }, allData);
    timeline = new Timeline({ parentElement: "#timeline" });
  })
  .catch((error) => console.error(error));
