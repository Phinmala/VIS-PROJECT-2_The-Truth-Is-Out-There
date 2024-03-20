class pieChart {
    /**
     * Class Constructor
     */
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 600, 
            containerHeight: _config.containerHeight || 600, 
            margin: _config.margin || {top: 25, right: 25, bottom: 35, left: 55}
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
            .attr("height", vis.height)
            //.attr("transform", `translate(${vis.width/2}, ${vis.height/2})`);
        // Array.from(vis.countData, ([key, values]) => {
        //     console.log(key);
        //     console.log(values.length);
        // });
        vis.radius = Math.min(vis.width, vis.height) / 2;

        vis.colorScale = d3.scaleOrdinal()
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])

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
    }    
}