
function drawRadarChart(elementId, data) {
    //const margin = { top: 100, right: 100, bottom: 150, left: 270 },
      //  width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
        //height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

    // const hourlyColors = [
    //     "#003366", // 24h 
    //     "#003366", // 24h 
    //     "#003366", // 01h 
    //     "#003366", // 02h 
    //     "#2f4b7c", // 04h 
    //     "#665191", // 05h 
    //     "#a05195", // 06h 
    //     "#d45087", // 07h 
    //     "#f95d6a", // 08h 
    //     "#ff7c43", // 09h 
    //     "#ffa600", // 10h
    //     "#ffb700", // 11h 
    //     "#ffc800", // 12h 
    //     "#ffb700", // 13h 
    //     "#ffa600", // 14h 
    //     "#ff7c43", // 15h 
    //     "#f95d6a", // 16h 
    //     "#d45087", // 17h
    //     "#a05195", // 18h 
    //     "#665191", // 19h 
    //     "#2f4b7c", // 20h 
    //     "#003f5c", // 21h 
    //     "#003366", // 22h 
    //     "#003366", // 23h 
    // ];

    d3.select(elementId).select("svg").remove();

    // const svg = d3.select(elementId)
    //     .append("svg")
    //     .attr("width", width + margin.left + margin.right)
    //     .attr("height", height + margin.top + margin.bottom)
    //     .append("g")
    //     .attr("transform", `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);

    // const radius = Math.min(width / 2, height / 2);
    // const angleSlice = Math.PI * 2 / 24;

    // const getAngle = (i) => {
    //     return ((-90 + i * 360 / 24) * Math.PI / 180) % (Math.PI * 2);
    // };

    // const rScale = d3.scaleLinear()
    //     .range([0, radius])
    //     .domain([0, d3.max(data, d => d.count)]);

    // const labelArc = d3.arc()
    //     .innerRadius(radius)
    //     .outerRadius(radius + 20)
    //     .startAngle((d, i) => i * angleSlice - angleSlice / 2)
    //     .endAngle((d, i) => i * angleSlice + angleSlice / 2);

    // data.forEach((d, i) => {
    //     svg.append("path")
    //         .attr("d", labelArc(d, i))
    //         .attr("fill", hourlyColors[i % 24])
    //         .attr("transform", `translate(0, 0)`);
    // });

    // const radarLine = d3.lineRadial()
    //     .curve(d3.curveLinearClosed)
    //     .radius(d => rScale(d.count))
    //     .angle((d, i) => i * angleSlice);


    // const radarArea = svg.append("path")
    //     .datum(data)
    //     .attr("class", "radarArea")
    //     .attr("d", radarLine)
    //     .style("fill", "black")
    //     .style("fill-opacity", 0.1);

    // const labels = svg.selectAll(".radarLabel")
    //     .data(data)
    //     .enter()
    //     .append("text")
    //     .attr("class", "radarLabel")
    //     .attr("x", (d, i) => (radius + margin.top / 2) * Math.cos(getAngle(i)))
    //     .attr("y", (d, i) => (radius + margin.top / 2) * Math.sin(getAngle(i)))
    //     .text(d => d.hour === "00" ? "24h" : d.hour + "h")
    //     .attr("text-anchor", "middle")
    //     .attr("dominant-baseline", "central")
    //     .style("fill", "black");

    // const tooltip = d3.select(elementId).append("div")
    //     .attr("class", "radar-tooltip")
    //     .style("position", "absolute")
    //     .style("visibility", "hidden")
    //     .style("padding", "10px")
    //     .style("background", "rgba(255, 255, 255, 0.8)")
    //     .style("border", "1px solid #ddd")
    //     .style("border-radius", "5px")
    //     .style("pointer-events", "none")
    //     .style("text-align", "left")
    //     .style("color", "#333");

    // const axisGrid = svg.append("g").attr("class", "axisWrapper");
    // axisGrid.selectAll(".axis")
    //     .data(data)
    //     .enter().append("line")
    //     .attr("class", "axis")
    //     .attr("x1", 0)
    //     .attr("y1", 0)
    //     .attr("x2", (d, i) => rScale(d3.max(data, d => d.count)) * Math.cos(getAngle(i)))
    //     .attr("y2", (d, i) => rScale(d3.max(data, d => d.count)) * Math.sin(getAngle(i)))
    //     .attr("stroke", "lightgrey")
    //     .attr("stroke-width", "1px")
    // axisGrid.selectAll(".axis-hover")
    //     .data(data)
    //     .enter().append("line")
    //     .attr("class", "axis-hover")
    //     .attr("x1", 0)
    //     .attr("y1", 0)
    //     .attr("x2", (d, i) => rScale(d3.max(data, d => d.count)) * Math.cos(getAngle(i)))
    //     .attr("y2", (d, i) => rScale(d3.max(data, d => d.count)) * Math.sin(getAngle(i)))
    //     .attr("stroke", "transparent")
    //     .attr("stroke-width", "20px")

        // .on("mouseover", function (event, d) {
        //     const i = data.indexOf(d);
        //     const displayHour = d.hour === "00" ? "24" : d.hour;
        //     d3.select(points.nodes()[i])
        //         .style("visibility", "visible");

        //     tooltip.html(`<strong>${displayHour}:00</strong><br>Frequency: ${d.count}`)
        //         .style("visibility", "visible")
        //         .style("left", (event.pageX + 10) + "px")
        //         .style("top", (event.pageY + 10) + "px");
        // })

        // .on("mouseout", function () {
        //     d3.selectAll(".radarPoint")
        //         .style("visibility", "hidden");

        //     tooltip.style("visibility", "hidden");
        // });

    // const radarOutline = svg.append("path")
    //     .datum(data)
    //     .attr("class", "radarOutline")
    //     .attr("d", radarLine)
    //     .style("stroke", "black")
    //     .style("stroke-width", "2px")
    //     .style("fill", "none");

    // svg.append("text")
    //     .attr("class", "chart-title")
    //     .attr("x", 0)
    //     .attr("y", (100 + height / 2))
    //     .attr("text-anchor", "middle")
    //     .attr("dominant-baseline", "middle")
    //     .style("font-size", "24px")
    //     .text("UFO Sightings Over 24 Hours");

    const points = svg.selectAll(".radarPoint")
        .data(data)
        .enter().append("circle")
        .attr("class", "radarPoint")
        .attr("cx", (d, i) => rScale(d.count) * Math.cos(getAngle(i)))
        .attr("cy", (d, i) => rScale(d.count) * Math.sin(getAngle(i)))
        .attr("r", 4)
        .style("fill", "red")
        .style("visibility", "hidden");


}
// function aggregateSightingsByHour(data) {
//     const hourCounts = {};

//     data.forEach(d => {
//         const dateTime = d.date_time;
//         let hour = dateTime.split(' ')[1].split(':')[0];

//         if (hour === "24") {
//             hour = "00";
//         }

//         if (!hourCounts[hour]) {
//             hourCounts[hour] = 0;
//         }
//         hourCounts[hour] += 1;
//     });

//     const formattedData = Object.keys(hourCounts).map(hour => {
//         console.log(`Hour: ${hour}, Frequency: ${hourCounts[hour]}`);
//         return { hour: hour, count: hourCounts[hour] };
//     });

//     return formattedData;
// }



initVis() {
    let vis = this;
    vis.agreggatedData = vis.aggregateSightingsByHour(vis.data);
    vis.height = Math.min(vis.config.width, window.innerHeight - vis.config.margin.top - vis.config.margin.bottom - 20),
    vis.radius = Math.min(vis.config.width / 2, vis.height / 2);
    vis.angleSlice = Math.PI * 2 / 24;
    vis.svg = d3.select(vis.config.parentElement).append("svg")
        .attr("width", vis.config.width + vis.config.margin.left + vis.config.margin.right)
        .attr("height", vis.height + vis.config.margin.top + vis.config.margin.bottom)
        .append("g")
        .attr("transform", `translate(${vis.config.width / 2 + vis.config.margin.left}, ${vis.height / 2 + vis.config.margin.top})`);

    vis.rScale = d3.scaleLinear()
        .range([0, vis.radius])
        .domain([0, d3.max(vis.agreggatedData, d => d.count)]);

    vis.labelArc = d3.arc()
        .innerRadius(vis.radius)
        .outerRadius(vis.radius + 20)
        .startAngle((d, i) => i * vis.angleSlice - vis.angleSlice / 2)
        .endAngle((d, i) => i * vis.angleSlice + vis.angleSlice / 2);

    vis.agreggatedData.forEach((d, i) => {
        vis.svg.append("path")
            .attr("d", vis.labelArc(d, i))
            .attr("fill", vis.hourlyColors[i % 24])
            .attr("transform", `translate(0, 0)`);
    });

    vis.radarLine = d3.lineRadial()
        .curve(d3.curveLinearClosed)
        .radius(d => vis.rScale(d.count))
        .angle((d, i) => i * vis.angleSlice);

    vis.radarArea = vis.svg.append("path")
        .datum(vis.agreggatedData)
        .attr("class", "radarArea")
        .attr("d", vis.radarLine)
        .style("fill", "black")
        .style("fill-opacity", 0.1);

    vis.labels = vis.svg.selectAll(".radarLabel")
        .data(vis.agreggatedData)
        .enter()
        .append("text")
        .attr("class", "radarLabel")
        .attr("x", (d, i) => (vis.radius + vis.config.margin.top / 2) * Math.cos(vis.getAngle(i)))
        .attr("y", (d, i) => (vis.radius + vis.config.margin.top / 2) * Math.sin(vis.getAngle(i)))
        .text(d => d.hour === "00" ? "24h" : d.hour + "h")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .style("fill", "black");


    vis.axisGrid = vis.svg.append("g").attr("class", "axisWrapper");
    vis.axisGrid.selectAll(".axis")
        .data(vis.agreggatedData)
        .enter().append("line")
        .attr("class", "axis")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => vis.rScale(d3.max(vis.agreggatedData, d => d.count)) * Math.cos(vis.getAngle(i)))
        .attr("y2", (d, i) => vis.rScale(d3.max(vis.agreggatedData, d => d.count)) * Math.sin(vis.getAngle(i)))
        .attr("stroke", "lightgrey")
        .attr("stroke-width", "1px")
    vis.axisGrid.selectAll(".axis-hover")
        .data(vis.agreggatedData)
        .enter().append("line")
        .attr("class", "axis-hover")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => vis.rScale(d3.max(vis.agreggatedData, d => d.count)) * Math.cos(vis.getAngle(i)))
        .attr("y2", (d, i) => vis.rScale(d3.max(vis.agreggatedData, d => d.count)) * Math.sin(vis.getAngle(i)))
        .attr("stroke", "transparent")
        .attr("stroke-width", "20px")
        .on("mouseover", function (event, d) {
            const i = vis.agreggatedData.indexOf(d);
            const displayHour = d.hour === "00" ? "24" : d.hour;
            d3.select(vis.points.nodes()[i])
                .style("visibility", "visible");
            tooltip.style("visibility", "visible").html(`
            <div class="tooltip-title">${displayHour}:00</div>
            <div><b>Frequency:</b> ${d.count}</div>
        </div>`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })

        .on("mouseout", function () {
            d3.selectAll(".radarPoint")
                .style("visibility", "hidden");

            tooltip.style("visibility", "hidden");
        });

        vis.radarOutline = vis.svg.append("path")
        .datum(vis.agreggatedData)
        .attr("class", "radarOutline")
        .attr("d", vis.radarLine)
        .style("stroke", "black")
        .style("stroke-width", "2px")
        .style("fill", "none");

        vis.svg.append("text")
        .attr("class", "chart-title")
        .attr("x", 0)
        .attr("y", (100 + vis.height / 2))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "24px")
        .text("UFO Sightings Over 24 Hours");

        vis.points = vis.svg.selectAll(".radarPoint")
        .data(vis.agreggatedData)
        .enter().append("circle")
        .attr("class", "radarPoint")
        .attr("cx", (d, i) => vis.rScale(d.count) * Math.cos(vis.getAngle(i)))
        .attr("cy", (d, i) => vis.rScale(d.count) * Math.sin(vis.getAngle(i)))
        .attr("r", 4)
        .style("fill", "red")
        .style("visibility", "hidden");

    vis.updateVis()
}
