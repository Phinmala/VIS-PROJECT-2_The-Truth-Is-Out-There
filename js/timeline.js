// Adapted from https://d3-graph-gallery.com/graph/connectedscatter_basic.html
class Timeline {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      // Change the container sizes after laying out all visualizations
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 200,
      margin: { top: 50, bottom: 50, right: 20, left: 80 },
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

    vis.x = d3.scaleLinear().range([0, vis.config.containerWidth]);
    vis.xAxis = vis.svg
      .append("g")
      .attr("transform", `translate(0,${vis.config.containerHeight})`);

    vis.y = d3.scaleLinear().range([vis.config.containerHeight, 0]);
    vis.yAxis = vis.svg.append("g");

    // Y axis label
    vis.svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - vis.config.margin.left + 20)
      .attr("x", 0 - vis.config.containerHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Number of Sightings");

    // X axis label
    vis.svg
      .append("text")
      .attr(
        "transform",
        "translate(" +
          vis.config.containerWidth / 2 +
          " ," +
          (vis.config.containerHeight + 35) +
          ")"
      )
      .style("text-anchor", "middle")
      .text("Year");

    vis.brushG = vis.svg.append("g").attr("class", "brush");

    vis.brush = d3
      .brushX()
      .extent([
        [0, 0],
        [vis.config.containerWidth, vis.config.containerHeight],
      ])
      // Reset the filtered data
      .on("start", () => (filteredSightings = []))
      .on("end", (result) => vis.filterBySelection(result, vis));

    vis.legend = vis.svg
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        () => `translate(${vis.config.containerWidth + 15},${0})`
      );

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

    // Sort the sightings by year
    const yearExtent = d3.extent(vis.data, (d) => d.date_time.getFullYear());
    const yearsData = [];
    for (let year = yearExtent[0]; year <= yearExtent[1]; year++) {
      yearsData.push({
        year: year,
        data: [],
      });
    }
    vis.data.forEach((sighting) => {
      const sightingYear = sighting.date_time.getFullYear();
      const yearIndex = yearsData.findIndex((d) => d.year == sightingYear);
      yearsData[yearIndex].data.push(sighting);
    });

    vis.x.domain(yearExtent);
    vis.xAxis.call(d3.axisBottom(vis.x).tickFormat(d3.format("d")));

    vis.y.domain([0, d3.max(yearsData, (d) => d.data.length)]);
    vis.yAxis.call(d3.axisLeft(vis.y));

    // Add lines
    vis.svg
      .selectAll("path.line")
      .data([yearsData])
      .join("path")
      .attr("class", "line")
      .attr(
        "d",
        d3
          .line()
          .x((d) => vis.x(d.year))
          .y((d) => vis.y(d.data.length))
      )
      .attr("stroke", "black")
      .style("stroke-width", 1)
      .style("fill", "none");

    // Add points
    vis.svg
      .selectAll(".linePoint")
      .data(yearsData)
      .join("g")
      .attr("class", "linePoint")
      .style("fill", "black")
      .selectAll("circle.connectedPoint")
      .data(yearsData)
      .join("circle")
      .attr("class", "connectedPoint")
      .attr("cx", (d) => vis.x(d.year))
      .attr("cy", (d) => vis.y(d.data.length))
      .attr("r", 2);

    // The following code was modified from https://observablehq.com/@giorgiofighera/histogram-with-tooltips-and-bars-highlighted-on-mouse-over
    d3.selectAll("circle.connectedPoint")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke-width", "2").attr("stroke", "white");
        tooltip.style("visibility", "visible").html(`
              <div class="tooltip-title">${d.year}</div>
              <div><b>Number of sightings</b>: ${d.data.length}</div>
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
      })
      .on("mousedown", function (event) {
        vis.svg
          .select(".overlay")
          .node()
          .dispatchEvent(
            new MouseEvent("mousedown", {
              bubbles: true,
              clientX: event.clientX,
              clientY: event.clientY,
              pageX: event.pageX,
              pageY: event.pageY,
              view: window,
              layerX: event.layerX,
              layerY: event.layerY,
              cancelable: true,
            })
          );
      });

    vis.brushG.call(vis.brush);
  }

  filterBySelection(result, vis) {
    if (!result.sourceEvent) return; // Only transition after input

    const extent = result.selection;

    if (!extent) {
      // Reset the filter (include them all)
      filteredSightings = [];
    } else {
      // Filter the sightings
      const range = [vis.x.invert(extent[0]), vis.x.invert(extent[1])];

      filteredSightings = allData
        .filter((d) => {
          const thisSightingYear = d.date_time.getFullYear();
          return thisSightingYear >= range[0] && thisSightingYear <= range[1];
        })
        .map((d) => d.id);
    }

    // Update all visualizations
    updateVisualizations(vis);
  }
}
