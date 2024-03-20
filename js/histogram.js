class Histogram {
    /**
     * Class Constructor
     */
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 600, 
            containerHeight: _config.containerHeight || 250, 
            margin: _config.margin || {top: 25, right: 25, bottom: 35, left: 55}
        }
        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale);

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0, ${vis.height})`);

        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');

        // X Axis Label
        vis.chart.append('text')
            .attr('class', 'text1')
            .attr('y', vis.height + 20)
            .attr('x', vis.width + 10)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text('Encounter Length (seconds)');

        // Y Axis Label
        vis.svg.append('text')
            .attr('class', 'text2')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', '.71em')
            .text('Number of Encounters');

        vis.xValue = d => d.encounter_length;
        
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.data = vis.data.filter((d) => ((vis.xValue(d) < 10000)));

        vis.xScale.domain(d3.extent(vis.data, vis.xValue));

        vis.xAxisG
            .call(vis.xAxis
                .ticks(vis.width / 40)
                .tickSizeOuter(0));
        
        let histogram = d3.histogram()
            .value(d => d.encounter_length)
            .domain(vis.xScale.domain())
            .thresholds(vis.xScale.ticks(100));

        vis.bins = histogram(vis.data);

        vis.yScale.domain([0, d3.max(vis.bins, d => d.length)]);

        vis.yAxisG
            .call(vis.yAxis);

        vis.rectangles = vis.chart 
            .selectAll('.rect')
                .data(vis.bins)
            .join('rect')
                .attr('class', 'rect')
                .attr('fill', 'gray')
                .attr('x', 1)
                .attr('transform', function(d) {return `translate(${vis.xScale(d.x0)}, ${vis.yScale(d.length)})`})
                .attr('width', function(d) {return vis.xScale(d.x1) - vis.xScale(d.x0) - 1})
                .attr('height', function(d) {return vis.height - vis.yScale(d.length);})
        
    }


}