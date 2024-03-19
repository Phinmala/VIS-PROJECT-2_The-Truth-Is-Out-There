


d3.csv('data/ufo_sightings.csv')
.then(data => {
    console.log(data[0]);
    console.log(data.length);
    const filteredData = data.filter(d => d.latitude !== "NA" && d.longitude !== "NA");
        //for some reason theres a data point (row 43784 in ufo_sightings) where the latitude doesn't exist
        //it prevents the data from loading on the map so i filtered it out
        filteredData.forEach(d => {
            //console.log(d);
            d.latitude = +d.latitude; //make sure these are not strings
            d.longitude = +d.longitude; //make sure these are not strings
        });

    // Initialize chart and then show it
    leafletMap = new LeafletMap({ parentElement: '#my-map'}, filteredData);


  })
  .catch(error => console.error(error));
