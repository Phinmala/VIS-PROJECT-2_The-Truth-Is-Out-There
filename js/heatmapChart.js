class HeatmapChart {
  constructor(_config) {
    const defaultMargin = { top: 50, right: 0, bottom: 100, left: 100 };
    const margin = _config.margin || defaultMargin;
    const scaleGrid = 0.5;
    this.config = {
      parentElement: _config.parentElement,
      margin: margin,
      scaleGrid: scaleGrid,
      width: 960 - margin.left - margin.right * scaleGrid,
      cellSizePercentage: 0.95,
    };

    this.data = allData;
    this.monthColors = {
      Jan: [
        "#460000",
        "#740000",
        "#a20000",
        "#d10000",
        "#ff0000",
        "#ff2e2e",
        "#ff5d5d",
        "#ff8b8b",
        "#ffb9b9",
        "#ffe8e8",
      ],
      Feb: [
        "#3f0714",
        "#690b22",
        "#921030",
        "#bc143d",
        "#e6194b",
        "#eb436c",
        "#ef6d8c",
        "#f496ad",
        "#f8c0ce",
        "#fdeaef",
      ],
      Mar: [
        "#421d03",
        "#6f3105",
        "#9b4408",
        "#c7580a",
        "#f36b0c",
        "#f58638",
        "#f7a164",
        "#fabc90",
        "#fcd7bd",
        "#fef2e9",
      ],
      Apr: [
        "#38240d",
        "#5e3c16",
        "#83551f",
        "#a96d28",
        "#cf8530",
        "#d79b56",
        "#e0b17b",
        "#e9c7a1",
        "#f2dec7",
        "#fbf4ec",
      ],
      May: [
        "#464600",
        "#747400",
        "#a2a200",
        "#d1d100",
        "#ffff00",
        "#ffff2e",
        "#ffff5d",
        "#ffff8b",
        "#ffffb9",
        "#ffffe8",
      ],
      Jun: [
        "#113416",
        "#1d5724",
        "#297a33",
        "#349c41",
        "#40bf50",
        "#63cb70",
        "#85d68f",
        "#a8e2af",
        "#cbeecf",
        "#eef9ef",
      ],
      Jul: [
        "#16302d",
        "#244f4b",
        "#336f69",
        "#418f87",
        "#50afa5",
        "#70bdb5",
        "#90ccc6",
        "#afdbd6",
        "#cfe9e6",
        "#eff8f7",
      ],
      Aug: [
        "#043742",
        "#065b6d",
        "#097f99",
        "#0ba4c5",
        "#0ec8f1",
        "#3ad2f4",
        "#66dcf6",
        "#91e6f9",
        "#bdf0fb",
        "#e9fafe",
      ],
      Sep: [
        "#0c163a",
        "#142460",
        "#1c3386",
        "#2441ad",
        "#2c50d3",
        "#5270db",
        "#798fe3",
        "#9fafeb",
        "#c5cff3",
        "#eceffb",
      ],
      Oct: [
        "#300a3c",
        "#501163",
        "#70178b",
        "#901eb3",
        "#b024db",
        "#be4ce1",
        "#cd74e8",
        "#db9cee",
        "#e9c3f5",
        "#f8ebfc",
      ],
      Nov: [
        "#41053e",
        "#6c0867",
        "#970b90",
        "#c20eb9",
        "#ee11e2",
        "#f13de7",
        "#f468ed",
        "#f793f2",
        "#fabef7",
        "#fde9fc",
      ],
      Dec: [
        "#232323",
        "#3a3a3a",
        "#515151",
        "#686868",
        "#808080",
        "#979797",
        "#aeaeae",
        "#c5c5c5",
        "#dcdcdc",
        "#f3f3f3",
      ],
    };
    this.maxValuesPerMonth = {
      Jan: 2952,
      Feb: 2535,
      Mar: 2745,
      Apr: 2695,
      May: 2650,
      Jun: 3324,
      Jul: 4184,
      Aug: 4133,
      Sep: 3881,
      Oct: 3626,
      Nov: 3311,
      Dec: 2746,
    };

    this.monthNames = Object.keys(this.monthColors);
    this.colorScales = this.initializeColorScales();

    this.initVis();
  }

  initVis() {
    let vis = this;
    vis.allDecades = [
      2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930, 1920, 1910, 1900,
    ];
    vis.processedData = vis.aggregateSightingsByDecade(vis.data);
    vis.uniqueMonths = vis.monthNames;
    vis.gridSize = Math.floor(
      (vis.config.width / 12) *
        vis.config.cellSizePercentage *
        vis.config.scaleGrid
    );
    vis.height = vis.gridSize * vis.allDecades.length;

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
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    vis.xScale = d3
      .scaleBand()
      .range([0, vis.gridSize * 12])
      .domain(vis.uniqueMonths)
      .padding(1 - vis.config.cellSizePercentage);

    vis.yScale = d3
      .scaleBand()
      .range([vis.height, 0])
      .domain(vis.allDecades)
      .padding(1 - vis.config.cellSizePercentage);

    vis.svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${vis.height})`)
      .call(d3.axisBottom(vis.xScale));

    vis.svg
      .append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(vis.yScale).tickFormat((d) => `${d}s`));

    vis.svg
      .append("text")
      .attr("class", "x axis-title")
      .attr("text-anchor", "middle")
      .attr("x", vis.config.width / 4 - 10)
      .attr("y", vis.height + vis.config.margin.bottom - 50)
      .text("Month");

    vis.svg
      .append("text")
      .attr("class", "y axis-title")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(-60,${vis.height / 2}) rotate(-90)`)
      .text("Decade");

    vis.svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", vis.config.width / 4 - 10)
      .attr("y", vis.height + vis.config.margin.bottom - 20)
      .attr("text-anchor", "middle")
      .text("Decadal Distribution of UFO Sightings by Month");

    vis.updateVis();
  }

  updateVis() {
    let vis = this;
    vis.cells = vis.svg
      .selectAll(".cell")
      .data(vis.processedData, (d) => `${d.decade}:${d.month}`)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", (d) => vis.xScale(vis.getMonthName(d.month)))
      .attr("y", (d) => vis.yScale(d.decade))
      .attr("width", vis.xScale.bandwidth())
      .attr("height", vis.yScale.bandwidth())
      .attr("fill", (d) => vis.colorScales[vis.getMonthName(d.month)](d.count))
      .on("mouseover", function (event, d) {
        const formattedMonthName = d3.timeFormat("%B")(
          new Date(2000, d.month - 1)
        );
        d3.select(this).attr("stroke-width", "2").attr("stroke", "black");
        tooltip
          .style("visibility", "visible")
          .html(
            `<div class="tooltip-title">${formattedMonthName} ${d.decade}s</div>
                <div><b>Frequency:</b> ${d.count}</div>
            </div>`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-width", "0");
        tooltip.style("visibility", "hidden");
      });
  }

  initializeColorScales() {
    const colorScales = {};
    this.monthNames.forEach((month) => {
      const max = this.maxValuesPerMonth[month];
      const colors = this.monthColors[month];
      const remaining = max - 1000;
      const colorScale = d3
        .scaleLinear()
        .domain([
          0,
          10,
          50,
          100,
          200,
          500,
          900,
          remaining / 3 + 1000,
          (remaining * 2) / 3 + 1000,
          remaining + 1000,
          max,
        ])
        .range(colors.reverse());

      colorScales[month] = colorScale;
    });
    return colorScales;
  }

  getMonthName(monthNumber) {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return monthNames[monthNumber - 1];
  }

  aggregateSightingsByDecade(data) {
    const aggregate = d3.rollups(
      data,
      (v) => v.length,
      (d) => {
        const decade = Math.floor(d.date_time.getFullYear() / 10) * 10;
        const month = (d.date_time.getMonth() + 1).toString().padStart(2, "0");
        return `${decade}-${month}`;
      }
    );

    const formattedData = aggregate.map(([decadeMonth, count]) => {
      const [decade, month] = decadeMonth.split("-");
      return { decade, month, count };
    });
    return formattedData;
  }
}
