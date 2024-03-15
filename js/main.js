


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
      d.date = d.date_time.split(' ')[0]; 
    });

    // Initialize chart and then show it
    leafletMap = new LeafletMap({ parentElement: '#my-map'}, filteredData);
    const sightingsByMonthYear = aggregateSightingsByMonthYear(filteredData);
    drawHeatmap("#heatmap1", sightingsByMonthYear);
    //drawHeatmap("#heatmap2", sightingsByMonthYear.filter(d => d.year > 1969));


  })
  .catch(error => console.error(error));

  function aggregateSightingsByMonthYear(data) {
    const aggregate = d3.rollups(data, v => v.length, d => {
        const [month, day, year] = d.date.split('/');
        return `${year}-${month.padStart(2, '0')}`; 
    });

    const formattedData = aggregate.map(([yearMonth, count]) => {
        const [year, month] = yearMonth.split('-');
        return { year, month, count };
    });
 
    return formattedData;
}