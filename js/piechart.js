class PieChart {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || { top: 25, right: 25, bottom: 35, left: 55 },
    };

    this.initVis();
  }

  initVis() {
    const vis = this;

    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr(
        "width",
        vis.config.containerWidth +
          vis.config.margin.left +
          vis.config.margin.right
      )
      .attr(
        "height",
        vis.config.containerHeight +
          vis.config.margin.top +
          vis.config.margin.bottom
      )
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    vis.radius = Math.min(vis.width, vis.height) / 2;

    vis.colorScale = d3
      .scaleOrdinal()
      .domain([
        "unknown",
        "other",
        "cylinder",
        "circle",
        "sphere",
        "disk",
        "oval",
        "cigar",
        "round",
        "dome",
        "crescent",
        "light",
        "fireball",
        "flash",
        "flare",
        "rectangle",
        "diamond",
        "cross",
        "hexagon",
        "chevron",
        "triangle",
        "delta",
        "cone",
        "pyramid",
        "formation",
        "changing",
        "egg",
        "teardrop",
        "changed",
      ])
      .range([
        "#A9A9A9",
        "#6A6A6A",
        "#E1E3FF",
        "#B9BDFD",
        "#A1A7FF",
        "#8088FE",
        "#636DFF",
        "#4551FF",
        "#202DE0",
        "#030C92",
        "#010654",
        "#FFE286",
        "#FFD03F",
        "#FFC100",
        "#DBA601",
        "#8EFF72",
        "#31F401",
        "#26BF00",
        "#125401",
        "#FA7F7F",
        "#FF4747",
        "#FF0000",
        "#BD0000",
        "#7F0000",
        "#B87FFA",
        "#9B45FC",
        "#7800FF",
        "#6200D1",
        "#3B007E",
      ]);

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

    vis.countData = d3.groups(vis.data, (d) => d.ufo_shape);

    const pie = d3.pie().value((d) => d[1].length);
    vis.pie = pie(vis.countData);

    vis.arcs = vis.svg
      .selectAll("path.piechart")
      .data(vis.pie)
      .join("path")
      .attr("class", "piechart")
      .attr("transform", `translate(${vis.width / 2}, ${vis.height / 2})`)
      .attr(
        "d",
        d3
          .arc()
          .innerRadius(0)
          .outerRadius(vis.radius)
          .startAngle((d) => d.startAngle)
          .endAngle((d) => d.endAngle)
      )
      .attr("fill", (d) => vis.colorScale(d.data[0]))
      .style("opacity", 0.7);

    vis.arcs
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible").html(`
            <div class="tooltip-title">UFO Shape: ${d.data[0]}</div>
            <div><b>Number of occurrences</b>: ${d.data[1].length}</div>
      `);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-width", "0");
        tooltip.style("visibility", "hidden");
      });
  }
}
