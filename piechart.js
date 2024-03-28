class pieChart {
    /**
     * Class Constructor
     */
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 600, 
            containerHeight: _config.containerHeight || 600, 
            margin: _config.margin || {top: 25, right: 25, bottom: 35, left: 55},
            tooltipPadding: _config.tooltipPadding || 15
        }
        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.countData = d3.groups(vis.data, d => d.ufo_shape);
        console.log(vis.countData);

        vis.chart = d3.select(vis.config.parentElement)
            .attr("width", vis.width)
            .attr("height", vis.height);

        vis.radius = Math.min(vis.width, vis.height) / 2;

        vis.colorScale = d3.scaleOrdinal()
            .domain(["unknown", "other", 
                "cylinder", "circle", "sphere", "disk", "oval", "cigar", "round", "dome", "crescent",
                "light", "fireball", "flash", "flare",
                "rectangle", "diamond", "cross", "hexagon",
                "chevron", "triangle", "delta", "cone", "pyramid",
                "formation", "changing", "egg", "teardrop", "changed"])
            .range(["#A9A9A9", "#6A6A6A",
                "#E1E3FF", "#B9BDFD", "#A1A7FF", "#8088FE", "#636DFF", "#4551FF", "#202DE0", "#030C92", "#010654",
                "#FFE286", "#FFD03F", "#FFC100", "#DBA601", 
                "#8EFF72", "#31F401", "#26BF00", "#125401", 
                "#FA7F7F", "#FF4747", "#FF0000", "#BD0000", "#7F0000", 
                "#B87FFA", "#9B45FC", "#7800FF", "#6200D1", "#3B007E"]);

        let pie = d3.pie()
            .value(function(d) {return d[1].length})

        vis.pie = pie(vis.countData)
        console.log(vis.pie);

        vis.arcs = vis.chart
            .selectAll('.path')
                .data(vis.pie)
                .enter()
            .append('path')
                .attr("transform", `translate(${vis.width/2}, ${vis.height/2})`)
                .attr('d', d3.arc()
                    .innerRadius(0)
                    .outerRadius(vis.radius)
                    .startAngle((d) => d.startAngle)
                    .endAngle((d) => d.endAngle)
                )
                .attr('fill', function(d) { return(vis.colorScale(d.data[0]))})
                .attr("stroke", "black")
                .style("stroke-width", "2px")
                .style("opacity", 0.7);
        
        vis.updateVis();
    }   
    
    updateVis() {
        let vis = this;

        vis.arcs
            .on('mouseover', (event, d) => {
                console.log(d);
            d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(`
                <div class="tooltip-title">UFO Shape: ${d.data[0]}</div>
                <i>Number of Occurences: ${d.data[1].length}</i>
                `);
            })
            .on('mouseleave', () => {
                d3.select('#tooltip').style('display', 'none');
            });
    }
}