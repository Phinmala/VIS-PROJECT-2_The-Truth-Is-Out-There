// Adapted from https://observablehq.com/@d3/bar-chart/2
class Barchart {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 800,
      containerHeight: _config.containerHeight || 500,
      margin: { top: 20, bottom: 50, right: 30, left: 50 },
    };

    this.lengthGroup = [
      "<5",
      "5-14",
      "15-29",
      "30-59",
      "60-119",
      "120-179",
      "180-239",
      "240-299",
      "300-359",
      "360-419",
      "420-599",
      "600-779",
      "780-1199",
      "1200-1499",
      "1500-2999",
      "3000-5999",
      "6000-11999",
      "12000-29999",
      "30000+",
    ];

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

    vis.x = d3
      .scaleBand()
      .domain(vis.lengthGroup)
      .range([0, vis.config.containerWidth]);
    vis.xAxis = vis.svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${vis.config.containerHeight})`)
      .call(d3.axisBottom(vis.x));

    vis.y = d3.scaleLinear().range([vis.config.containerHeight, 0]);
    vis.yAxis = vis.svg.append("g");

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
      .attr("y", 12)
      .style("text-anchor", "middle")
      .text("Encounter Length (seconds)");

    // Y axis label
    vis.svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - vis.config.margin.left - 3)
      .attr("x", 0 - vis.config.containerHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Number of Sightings");

    vis.brushG = vis.svg.append("g").attr("class", "brush");

    vis.brush = d3
      .brushX()
      .extent([
        [0, 0],
        [vis.config.containerWidth, vis.config.containerHeight],
      ])
      // Reset the filtered sightings
      .on("start", () => (filteredSightings = []))
      .on("end", (result) => vis.filterBySelection(result, vis));

    this.updateVis();
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

    // Split the sightings into groups by the encounter length (includes all sighting data)
    // Create an array of arrays (one sub-array for each duration group)
    vis.durationGroups = [];
    for (let i = 0; i < vis.lengthGroup.length; i++) {
      vis.durationGroups[i] = [];
    }
    // Add each encounter to the correct group
    vis.data.forEach((encounter) => {
      const length = +encounter.encounter_length;
      let index;
      if (length < 5) {
        index = 0;
      } else if (length < 15) {
        index = 1;
      } else if (length < 30) {
        index = 2;
      } else if (length < 60) {
        index = 3;
      } else if (length < 120) {
        index = 4;
      } else if (length < 180) {
        index = 5;
      } else if (length < 240) {
        index = 6;
      } else if (length < 300) {
        index = 7;
      } else if (length < 360) {
        index = 8;
      } else if (length < 420) {
        index = 9;
      } else if (length < 600) {
        index = 10;
      } else if (length < 780) {
        index = 11;
      } else if (length < 1200) {
        index = 12;
      } else if (length < 1500) {
        index = 13;
      } else if (length < 3000) {
        index = 14;
      } else if (length < 6000) {
        index = 15;
      } else if (length < 12000) {
        index = 16;
      } else if (length < 30000) {
        index = 17;
      } else {
        index = 18;
      }
      vis.durationGroups[index].push(encounter);
    });

    vis.y.domain([0, Math.max(...vis.durationGroups.map((arr) => arr.length))]);
    vis.yAxis.call(d3.axisLeft(vis.y));

    vis.svg
      .selectAll("rect.barchart-bar")
      .data(vis.durationGroups)
      .join("rect")
      .attr("class", "barchart-bar")
      .attr("x", (d, index) => vis.x(vis.lengthGroup[index]))
      .attr("y", (d) => vis.y(d.length))
      .attr("width", vis.x.bandwidth())
      .attr("height", (d) => vis.config.containerHeight - vis.y(d.length))
      .style("fill", "steelblue");

    vis.svg
      .selectAll(".x-axis text")
      .style("text-anchor", "end")
      .attr("transform", "rotate(-33)")
      .attr("dx", "-.8em")
      .attr("dy", ".15em");

    // The following code was modified from https://observablehq.com/@giorgiofighera/histogram-with-tooltips-and-bars-highlighted-on-mouse-over
    d3.selectAll("rect.barchart-bar")
      .on("mouseover", function (event, d) {
        const mouseLoc = d3.pointer(event)[0];
        const bandwidth = vis.x.bandwidth();
        const hoveredStatus = vis.lengthGroup.find((type) => {
          const barStart = vis.x(type);
          const barEnd = barStart + bandwidth;
          return barEnd >= mouseLoc && barStart <= mouseLoc;
        });
        d3.select(this).attr("stroke-width", "2").attr("stroke", "white");
        tooltip.style("visibility", "visible").html(`
              <div class="tooltip-title">${
                d.length
              } ${d.length === 1 ? "Sighting" : "Sightings"}</div>
              <div><b>Duration</b>: ${hoveredStatus} seconds</div>
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
      const brushStart = extent[0];
      const brushEnd = extent[1];
      const bandwidth = vis.x.bandwidth();
      const filteredDurations = [];

      // Determine the selected durations
      vis.lengthGroup.forEach((group) => {
        const barStart = vis.x(group);
        const barEnd = barStart + bandwidth;

        if (barEnd >= brushStart && barStart <= brushEnd)
          filteredDurations.push(group);
      });

      // Determine the indices of data to get from durationGroups
      let startIndex = vis.lengthGroup.indexOf(filteredDurations[0]);
      let endIndex = vis.lengthGroup.indexOf(
        filteredDurations[filteredDurations.length - 1]
      );

      // Add the selected data's IDs to filteredSightings
      for (let i = startIndex; i <= endIndex; i++) {
        filteredSightings = filteredSightings.concat(vis.durationGroups[i]);
      }
      filteredSightings = filteredSightings.map((sighting) => sighting.id);
    }

    // Update all visualizations
    updateVisualizations(vis);
  }
}
