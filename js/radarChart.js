class RadarChart {
  constructor(_config) {
    const defaultMargin = { top: 80, right: 80, bottom: 150, left: 80 };
    const margin = _config.margin || defaultMargin;
    this.config = {
      parentElement: _config.parentElement,
      margin: margin,
      width: Math.min(500, window.innerWidth - 50) - margin.left - margin.right,
    };
    this.hourlyColors = [
      "#003366", // 24h
      "#003366", // 01h
      "#003366", // 02h
      "#003f5c", // 03h
      "#2f4b7c", // 04h
      "#665191", // 05h
      "#a05195", // 06h
      "#d45087", // 07h
      "#f95d6a", // 08h
      "#ff7c43", // 09h
      "#ffa600", // 10h
      "#ffb700", // 11h
      "#ffc800", // 12h
      "#ffb700", // 13h
      "#ffa600", // 14h
      "#ff7c43", // 15h
      "#f95d6a", // 16h
      "#d45087", // 17h
      "#a05195", // 18h
      "#665191", // 19h
      "#2f4b7c", // 20h
      "#003f5c", // 21h
      "#003366", // 22h
      "#003366", // 23h
    ];
    this.maxFrequencies = {
      24: 4802,
      "01": 3210,
      "02": 2353,
      "03": 2008,
      "04": 1529,
      "05": 1590,
      "06": 1224,
      "07": 905,
      "08": 803,
      "09": 958,
      10: 1166,
      11: 1144,
      12: 1368,
      13: 1303,
      14: 1322,
      15: 1433,
      16: 1620,
      17: 2592,
      18: 4002,
      19: 6147,
      20: 8617,
      21: 11445,
      22: 10837,
      23: 7953,
    };
    this.hours = [
      "24",
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
    ];

    this.initVis();
  }

  initVis() {
    const vis = this;

    vis.height = Math.min(
      vis.config.width,
      window.innerHeight - vis.config.margin.top - vis.config.margin.bottom - 20
    );
    vis.radius = Math.min(vis.config.width / 2, vis.height / 2);
    vis.angleSlice = (Math.PI * 2) / 24;

    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr(
        "width",
        vis.config.width + vis.config.margin.left + vis.config.margin.right
      )
      .attr(
        "height",
        vis.height + vis.config.margin.top + vis.config.margin.bottom
      )
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.width / 2 + vis.config.margin.left}, ${
          vis.height / 2 + vis.config.margin.top
        })`
      );

    vis.labelArc = d3
      .arc()
      .innerRadius(vis.radius)
      .outerRadius(vis.radius + 20)
      .startAngle((d, i) => i * vis.angleSlice - vis.angleSlice / 2)
      .endAngle((d, i) => i * vis.angleSlice + vis.angleSlice / 2);

    vis.labels = vis.svg
      .selectAll(".radarLabel")
      .data(vis.hours)
      .enter()
      .append("text")
      .attr("class", "radarLabel")
      .attr(
        "x",
        (d, i) =>
          (vis.radius + vis.config.margin.top / 2 + 10) *
          Math.cos(vis.getAngle(i))
      )
      .attr(
        "y",
        (d, i) =>
          (vis.radius + vis.config.margin.top / 2 + 10) *
          Math.sin(vis.getAngle(i))
      )
      .text((d) => d + "h")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("fill", "black");

    vis.svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", 0)
      .attr("y", 100 + vis.height / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "24px")
      .text("UFO Sightings Over 24 Hours");

    vis.hoverSvg = vis.svg.append("g").attr("class", "axisHoverWrapper");
    Array.from(Array(24).keys()).forEach((i) => {
      let angle = vis.getAngle(i);
      vis.hoverSvg
        .append("line")
        .attr("class", "axis")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", vis.radius * Math.cos(angle))
        .attr("y2", vis.radius * Math.sin(angle))
        .attr("stroke", "lightgrey")
        .attr("stroke-width", "1px");
    });

    vis.updateVis();
  }
  updateVis() {
    const vis = this;

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

    vis.agreggatedData = vis.aggregateSightingsByHour(vis.data);

    vis.rScale = d3
      .scaleLinear()
      .range([0, vis.radius])
      .domain([0, d3.max(Object.values(vis.maxFrequencies))]);

    vis.maxRadiusScaled = vis.rScale(11445);

    vis.svg
      .selectAll("path.hourColor")
      .data(vis.agreggatedData)
      .join("path")
      .attr("class", "hourColor")
      .attr("d", (d, i) => vis.labelArc(d, i))
      .attr("fill", (d, i) => vis.hourlyColors[i % 24])
      .attr("transform", `translate(0, 0)`);

    vis.radarLine = d3
      .lineRadial()
      .curve(d3.curveLinearClosed)
      .radius((d) => vis.rScale(d.count))
      .angle((d, i) => i * vis.angleSlice);

    vis.radarArea = vis.svg
      .append("path")
      .datum(vis.agreggatedData)
      .attr("class", "radarArea")
      .attr("d", vis.radarLine)
      .style("fill", "black")
      .style("fill-opacity", 0.1);

    vis.hoverSvg
      .selectAll(".axis-hover")
      .data(vis.agreggatedData)
      .join("line")
      .attr("class", "axis-hover")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d, i) => vis.maxRadiusScaled * Math.cos(vis.getAngle(i)))
      .attr("y2", (d, i) => vis.maxRadiusScaled * Math.sin(vis.getAngle(i)))
      .attr("stroke", "transparent")
      .attr("stroke-width", "20px")
      .on("mouseover", function (event, d) {
        const i = vis.agreggatedData.indexOf(d);
        const displayHour = d.hour === "00" ? "24" : d.hour;
        d3.select(vis.points.nodes()[i]).style("visibility", "visible");
        tooltip
          .style("visibility", "visible")
          .html(
            `<div class="tooltip-title">${displayHour}:00</div>
                <div><b>Frequency:</b> ${d.count}</div>
            </div>`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px");
      })
      .on("mouseout", function () {
        d3.selectAll(".radarPoint").style("visibility", "hidden");
        tooltip.style("visibility", "hidden");
      });

    vis.radarOutline = vis.svg
      .append("path")
      .datum(vis.agreggatedData)
      .attr("class", "radarOutline")
      .attr("d", vis.radarLine)
      .style("stroke", "black")
      .style("stroke-width", "2px")
      .style("fill", "none");

    vis.points = vis.svg
      .selectAll(".radarPoint")
      .data(vis.agreggatedData)
      .join("circle")
      .attr("class", "radarPoint")
      .attr("cx", (d, i) => vis.rScale(d.count) * Math.cos(vis.getAngle(i)))
      .attr("cy", (d, i) => vis.rScale(d.count) * Math.sin(vis.getAngle(i)))
      .attr("r", 4)
      .style("fill", "red")
      .style("visibility", "hidden");
  }

  aggregateSightingsByHour(data) {
    const hourCounts = {};

    data.forEach((d) => {
      let dateTime = d.date_time;
      if (!(dateTime instanceof Date)) {
        dateTime = new Date(dateTime);
      }
      const hour = dateTime.getHours().toString().padStart(2, "0");

      if (!hourCounts[hour]) {
        hourCounts[hour] = 0;
      }
      hourCounts[hour] += 1;
    });

    const formattedData = Object.keys(hourCounts).map((hour) => ({
      hour: hour === "00" ? "24" : hour,
      count: hourCounts[hour],
    }));

    formattedData.sort((a, b) => {
      let hourA = a.hour === "24" ? "00" : a.hour;
      let hourB = b.hour === "24" ? "00" : b.hour;
      return parseInt(hourA, 10) - parseInt(hourB, 10);
    });

    formattedData.forEach((d) => {
      console.log(`Hour: ${d.hour}, Frequency: ${d.count}`);
    });

    return formattedData;
  }

  getAngle = (i) => {
    return (((-90 + (i * 360) / 24) * Math.PI) / 180) % (Math.PI * 2);
  };
}
