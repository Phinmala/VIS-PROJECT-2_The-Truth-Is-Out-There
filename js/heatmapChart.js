function drawHeatmap(selector, data) {
    const cellSizePercentage = 0.95;
    const scaleGrid = 0.5;
    const margin = { top: 50, right: 0, bottom: 100, left: 100 };
    const width = 960 - margin.left - margin.right * scaleGrid;
    const uniqueYears = new Set(data.map(d => d.year)).size;
    const gridSize = Math.floor((width / 12) * cellSizePercentage * scaleGrid);

    const height = gridSize * uniqueYears;

    const svg = d3.select(selector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const monthColors = {
        'Jan': ["#460000", "#740000", "#a20000", "#d10000", "#ff0000", "#ff2e2e", "#ff5d5d", "#ff8b8b", "#ffb9b9", "#ffe8e8"],
        'Feb': ["#3f0714", "#690b22", "#921030", "#bc143d", "#e6194b", "#eb436c", "#ef6d8c", "#f496ad", "#f8c0ce", "#fdeaef"],
        'Mar': ["#421d03", "#6f3105", "#9b4408", "#c7580a", "#f36b0c", "#f58638", "#f7a164", "#fabc90", "#fcd7bd", "#fef2e9"],
        'Apr': ["#38240d", "#5e3c16", "#83551f", "#a96d28", "#cf8530", "#d79b56", "#e0b17b", "#e9c7a1", "#f2dec7", "#fbf4ec"],
        'May': ["#464600", "#747400", "#a2a200", "#d1d100", "#ffff00", "#ffff2e", "#ffff5d", "#ffff8b", "#ffffb9", "#ffffe8"],
        'Jun': ["#113416", "#1d5724", "#297a33", "#349c41", "#40bf50", "#63cb70", "#85d68f", "#a8e2af", "#cbeecf", "#eef9ef"],
        'Jul': ["#16302d", "#244f4b", "#336f69", "#418f87", "#50afa5", "#70bdb5", "#90ccc6", "#afdbd6", "#cfe9e6", "#eff8f7"],
        'Aug': ["#043742", "#065b6d", "#097f99", "#0ba4c5", "#0ec8f1", "#3ad2f4", "#66dcf6", "#91e6f9", "#bdf0fb", "#e9fafe"],
        'Sep': ["#0c163a", "#142460", "#1c3386", "#2441ad", "#2c50d3", "#5270db", "#798fe3", "#9fafeb", "#c5cff3", "#eceffb"],
        'Oct': ["#300a3c", "#501163", "#70178b", "#901eb3", "#b024db", "#be4ce1", "#cd74e8", "#db9cee", "#e9c3f5", "#f8ebfc"],
        'Nov': ["#41053e", "#6c0867", "#970b90", "#c20eb9", "#ee11e2", "#f13de7", "#f468ed", "#f793f2", "#fabef7", "#fde9fc"],
        'Dec': ["#232323", "#3a3a3a", "#515151", "#686868", "#808080", "#979797", "#aeaeae", "#c5c5c5", "#dcdcdc", "#f3f3f3"]
    };

    const maxValuesPerMonth = {
        'Jan': 643, 'Feb': 481, 'Mar': 489, 'Apr': 573, 'May': 487, 'Jun': 695,
        'Jul': 902, 'Aug': 842, 'Sep': 717, 'Oct': 720, 'Nov': 621, 'Dec': 690
    };

    const monthOrder = {
        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    data.sort((a, b) => {
        return a.year - b.year || monthOrder[a.month] - monthOrder[b.month];
    });

    const colorScales = {};

    for (const month of monthNames) {
        const max = maxValuesPerMonth[month];
        const colors = monthColors[month];
        const remaining = max - 100;

        const colorScale = d3.scaleLinear()
            .domain([0, 14, 28, 42, 56, 70, 84, remaining / 3 + 100, remaining * 2 / 3 + 100, remaining + 100, max])
            .range(colors.reverse());

        colorScales[month] = colorScale;
    }

    const xScale = d3.scaleBand()
        .range([0, gridSize * 12])
        .domain(monthNames)
        .paddingInner(1 - cellSizePercentage);

    const yScale = d3.scaleBand()
        .range([0, gridSize * uniqueYears])
        .domain([...new Set(data.map(d => d.year))].sort((a, b) => a - b))
        .paddingInner(1 - cellSizePercentage);

    const tooltip = d3.select("body").append("div")
        .attr("class", "heatmap-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("padding", "10px")
        .style("background", "rgba(255, 255, 255, 0.8)")
        .style("border", "1px solid #ddd")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("text-align", "left")
        .style("color", "#333");

    svg.selectAll(".heatmap-square")
        .data(data, d => `${d.year}:${d.month}`)
        .enter()
        .append("rect")
        .attr("class", "heatmap-square")
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("x", d => xScale(monthNames[parseInt(d.month, 10) - 1]))
        .attr("y", d => yScale(d.year))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", d => {
            const monthIndex = d.month - 1;
            return d.count ? colorScales[monthNames[monthIndex]](d.count) : "white";
        })
        .on("mouseover", function(event, d) {
            d3.select(this)
              .style("stroke", "black")
              .style("stroke-width", 2);

            const formattedMonthName = d3.timeFormat("%B")(new Date(d.year, d.month - 1));
            tooltip.html(`<strong>${formattedMonthName}, ${d.year}</strong><br/>Frequency: ${d.count}`)
              .style("visibility", "visible")
              .style("left", (event.pageX + 20) + "px")
              .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
              .style("stroke", "none");

            tooltip.style("visibility", "hidden");
        });

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("text-anchor", "middle")
        .attr("transform", `translate(0, 0)`);

    svg.append("g")
        .attr("transform", "translate(0,0)")
        .call(d3.axisLeft(yScale));
}
