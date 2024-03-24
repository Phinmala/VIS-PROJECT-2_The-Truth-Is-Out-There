// Adapted from https://observablehq.com/@d3/bar-chart/2
class Barchart {
    constructor(_config) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 800,
        containerHeight: _config.containerHeight || 500,
        margin: { top: 20, bottom: 50, right: 30, left: 50 },
      };
      this.attributeName = "encounter_length";
      this.lengthGroup = ["<5", "5-15",  "15-30" , "30-60",
       "60-120", "120-180", "180-240", "240-300", "300-360",
       "360-420", "420-600", "600-780","780-1.2K" ,
       "1.2K-1.5K", "1.5K-3K","3K-6K", "6K-12K", 
       "12K-30K", "30K+"];
  
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
        .attr("transform", `translate(0,${vis.config.containerHeight})`)
        .call(d3.axisBottom(vis.x));
  
      vis.y = d3.scaleLinear().range([vis.config.containerHeight, 0]);
      vis.yAxis = vis.svg.append("g");
  
      // X axis label
      vis.svg
        .append("text")
        // .attr("class", "xLabel")
        .attr(
          "transform",
          "translate(" +
            vis.config.containerWidth / 2 +
            " ," +
            (vis.config.containerHeight + 35) +
            ")"
        )
        .style("text-anchor", "middle")
        .text('Encounter Length (seconds)');
  
      // Y axis label
      vis.svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - vis.config.margin.left)
        .attr("x", 0 - vis.config.containerHeight / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Sightings");
  
    //   vis.brushG = vis.svg.append("g").attr("class", "brush");
  
    //   vis.brush = d3
    //     .brushX()
    //     .extent([
    //       [0, 0],
    //       [vis.config.containerWidth, vis.config.containerHeight],
    //     ])
    //     // Reset the filtered counties
    //     .on("start", () => (filteredCounties = []))
    //     .on("end", (result) => vis.filterBySelection(result, vis));
  
      this.updateVis();
    }
  
    updateVis() {
      const vis = this;
  
      vis.data = allData;

      const encounterLengths = vis.data.map(d => d.encounter_length);

  
      // Count the number of counties of each type
      let statusCounts = new Array(this.lengthGroup.length).fill(0);

      encounterLengths.forEach((length) => {
        if (length < 5) {
            statusCounts[0]++;
        } else if (length >= 5 && length < 15) {
            statusCounts[1]++;
        } else if (length >= 15 && length < 30) {
            statusCounts[2]++;
        } else if (length >= 30 && length < 60) {
            statusCounts[3]++;
        } else if (length >= 60 && length < 120) {
            statusCounts[4]++;
        } else if (length >= 120 && length < 180) {
            statusCounts[5]++;
        } else if (length >= 180 && length < 240) {
            statusCounts[6]++;
        } else if (length >= 240 && length < 300) {
            statusCounts[7]++;
        } else if (length >= 300 && length < 360) {
            statusCounts[8]++;
        } else if (length >= 360 && length < 420) {
            statusCounts[9]++;
        } else if (length >= 420 && length < 600) {
            statusCounts[10]++;
        } else if (length >= 600 && length < 780) {
            statusCounts[11]++;
        } else if (length >= 780 && length < 1200) {
            statusCounts[12]++;
        } else if (length >= 1200 && length < 1500) {
            statusCounts[13]++;
        } else if (length >= 1500 && length < 3000) {
            statusCounts[14]++;
        } else if (length >= 3000 && length < 6000) {
            statusCounts[15]++;
        } else if (length >= 6000 && length < 12000) {
            statusCounts[16]++;
        } else if (length >= 12000 && length < 30000) {
            statusCounts[17]++;
        } else {
            statusCounts[18]++;
        }
    });
    

      vis.y.domain([0, Math.max(...statusCounts)]);
      vis.yAxis.call(d3.axisLeft(vis.y));
  
      vis.svg
        .selectAll("rect.barchart-bar")
        .data(statusCounts)
        .join("rect")
        .attr("class", "barchart-bar")
        .attr("x", (d, index) => vis.x(vis.lengthGroup[index]))
        .attr("y", (d) => vis.y(d))
        .attr("width", vis.x.bandwidth())
        .attr("height", (d) => vis.config.containerHeight - vis.y(d))
        .style("fill", "steelblue");
  
      // The following code was modified from https://observablehq.com/@giorgiofighera/histogram-with-tooltips-and-bars-highlighted-on-mouse-over
    //   d3.selectAll("rect.barchart-bar")
    //     .on("mouseover", function (event, d) {
    //       const mouseLoc = d3.pointer(event)[0];
    //       const bandwidth = vis.x.bandwidth();
    //       const hoveredStatus = vis.lengthGroup.find((type) => {
    //         const barStart = vis.x(type);
    //         const barEnd = barStart + bandwidth;
    //         return barEnd >= mouseLoc && barStart <= mouseLoc;
    //       });
    //       d3.select(this).attr("stroke-width", "2").attr("stroke", "white");
    //       tooltip.style("visibility", "visible").html(`
    //           <div class="tooltip-title">${d} ${d === 1 ? "County" : "Counties"}</div>
    //           <div><b>Status</b>: ${hoveredStatus}</div>
    //           `);
    //     })
    //     .on("mousemove", function (event) {
    //       tooltip
    //         .style("top", event.pageY - 10 + "px")
    //         .style("left", event.pageX + 10 + "px");
    //     })
    //     .on("mouseout", function () {
    //       d3.select(this).attr("stroke-width", "0");
    //       tooltip.style("visibility", "hidden");
    //     })
    //     .on("mousedown", function (event) {
    //       vis.svg
    //         .select(".overlay")
    //         .node()
    //         .dispatchEvent(
    //           new MouseEvent("mousedown", {
    //             bubbles: true,
    //             clientX: event.clientX,
    //             clientY: event.clientY,
    //             pageX: event.pageX,
    //             pageY: event.pageY,
    //             view: window,
    //             layerX: event.layerX,
    //             layerY: event.layerY,
    //             cancelable: true,
    //           })
    //         );
    //     });
  
    //   vis.brushG.call(vis.brush);
    }
  
    // filterBySelection(result, vis) {
    //   if (!result.sourceEvent) return; // Only transition after input
  
    //   const extent = result.selection;
  
    //   if (!extent) {
    //     // Reset the counties filter (include them all)
    //     filteredCounties = [];
    //   } else {
    //     const brushStart = extent[0];
    //     const brushEnd = extent[1];
    //     const bandwidth = vis.x.bandwidth();
    //     const filteredStatuses = [];
    //     vis.statusTypes.forEach((type) => {
    //       const barStart = vis.x(type);
    //       const barEnd = barStart + bandwidth;
  
    //       if (barEnd >= brushStart && barStart <= brushEnd)
    //         filteredStatuses.push(type);
    //     });
  
    //     // Filter the counties
    //     filteredCounties = countiesData
    //       .filter((d) => filteredStatuses.includes(d[vis.attributeName]))
    //       .map((d) => d.cnty_fips);
    //   }
  
    //   updateVisualizations(vis);
  
    //   vis.brushG.call(vis.brush.move, null);
    // }
  }