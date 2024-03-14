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
        leafletMap = new LeafletMap({ parentElement: '#my-map' }, filteredData);
        const sightingsByHour = aggregateSightingsByHour(data);
        const sightingsByHourSorted = sightingsByHour.sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

        drawRadarChart("#radarChart", sightingsByHourSorted);


    })
    .catch(error => console.error(error));

function aggregateSightingsByHour(data) {
    const hourCounts = {};

    data.forEach(d => {
        const dateTime = d.date_time;
        let hour = dateTime.split(' ')[1].split(':')[0];

        if (hour === "24") {
            hour = "00";
        }

        if (!hourCounts[hour]) {
            hourCounts[hour] = 0;
        }
        hourCounts[hour] += 1;
    });

    const formattedData = Object.keys(hourCounts).map(hour => {
        console.log(`Hour: ${hour}, Frequency: ${hourCounts[hour]}`);
        return { hour: hour, count: hourCounts[hour] };
    });

    return formattedData;
}
