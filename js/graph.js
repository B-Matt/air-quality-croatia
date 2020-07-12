class Graph {

    constructor(width, height, margin) {

        this.isShown = false;
        
        this.width = width - margin.left - margin.right;
        this.height = height - margin.top - margin.bottom;
        this.margin = margin;

        this.svg = d3.select("#aq-stat-graph-wrapper")
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        this.y = d3.scale.linear()					
            .range([this.height, 0]);

        this.x = d3.time.scale()                    
            .range([0, this.width - 5]);

        this.yAxis = d3.svg.axis()
            .orient("left")
            .scale(this.y);
            
        this.xAxis = d3.svg.axis()
            .orient("bottom")
            .scale(this.x)
            .ticks(d3.time.months)
            .tickSize(12, 0)
            .tickFormat(d3.time.format("%b %y"));

        const scope = this;
        this.line = d3.svg.line()
            .x(d => { return scope.x(d.x); })
            .y(d => { return scope.y(d.y); });

        this.color = d3.scale.category20();

        this.tooltip = d3.select("#aq-stat-graph-wrapper").append("div")
            .attr('id', 'tooltip')
            .style('position', 'absolute')
            .style("background-color", "#D3D3D3")
            .style('padding', 6)
            .style('display', 'none')
    }

    /**
     * Shows graph.
     * @param {*} data 
     * @param {*} dates 
     */
    show(data, dates) {
        
        const scope = this;
        const parsedData = this._parseData(data, dates);
        $("#aq-stat-graph svg g").empty();
        $("#aq-stat-graph-legend").empty();

        this.y.domain(d3.extent(parsedData, d => { return d.y; }));
        this.x.domain(d3.extent(parsedData, d => { return d.x; }));

        const sumstat = d3.nest()
            .key(d => { return d.name; })
            .entries(parsedData);

        this.svg.append("g")
            .attr("class", "axis x")
            .style("fill", "#A9A9A9")
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis);
            
        this.svg.append("g")
            .attr("class", "axis y")
            .style("fill", "#A9A9A9")
            .call(this.yAxis);

        this.svg.append("g")            
            .attr("class", "grid")
            .style("fill", "#A9A9A9")
            .attr("opacity", 0.5)
            .call(this._makeGridAxis()
                .tickSize(-this.width, 0, 0)
                .tickFormat("")
            );

        this.svg.selectAll(".line")
            .data(sumstat)
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", d => { return this.color(d.key) })
            .attr("stroke-width", 2)
            .attr("opacity", d => { return stations.pollutant == "all" ? 1 : d.key == stations.pollutant ? 1 : 0.5; })
            .attr("d", d => {

                return d3.svg.line()
                    .x(d => { return scope.x(d.x); })
                    .y(d => { return scope.y(d.y); })
                    .defined(d => { return d.y; })
                    (d.values)
            });

        // Legend
        this._createLegend(sumstat);

        // Hover Tooltip
        this._createTooltip(sumstat);

        // Show Graph
        $("#aq-stat-graph").fadeIn();
        this.isShown = true;
    }

    /**
     * Hides graph.
     */
    hide() {

        this.isShown = false;
        $("#aq-stat-graph svg g").empty();
        $("#aq-stat-graph").hide();
    }

    /**
     * Parses data and returns line data.
     * @param {*} data 
     * @param {*} dates 
     */
    _parseData(data, dates) {

        const parseDate = d3.time.format("%m.%Y").parse;
        let lineData = [];        
        const keys = Object.keys(data.rest_data);

        for(let i = 0, length = keys.length; i < length; i++) {

            for(let j = 0, length = dates.length; j < length; j++) {

                let tmpData = {};
                tmpData["name"] = keys[i];
                tmpData["x"] = parseDate(dates[j]);
                tmpData["y"] = data.rest_data[keys[i]][j];
                lineData.push(tmpData);
            }
        }
        return lineData;
    }

    /**
     * Creates grid behinds lines.
     */
    _makeGridAxis() {
        return d3.svg.axis()
            .scale(this.y)
            .orient("left")
    }

    /**
     * Creates and shows tooltip on graph.
     * @param {*} data 
     */
    _createTooltip(data) {

        const scope = this;
        const mouseG = this.svg.append("g")
            .attr("class", "mouse-over-effects");

        mouseG.append("path")
            .attr("class", "mouse-line")
            .style("stroke", "#A9A9A9")
            .style("stroke-width", 2)
            .style("opacity", "0");

        const mousePerLine = mouseG.selectAll('.mouse-per-line')
            .data(data)
            .enter()
            .append("g")
            .attr("class", "mouse-per-line");

        mousePerLine.append("circle")
            .attr("r", 4)
            .style("stroke", function (d) {
                return scope.color(d.key)
            })
            .style("fill", "none")
            .style("stroke-width", 2)
            .style("opacity", "0");

        mouseG.append('svg:rect')
            .attr('width', this.width) 
            .attr('height', this.height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mouseout', function () {
                d3.select(".mouse-line").style("opacity", "0");
                d3.selectAll(".mouse-per-line circle").style("opacity", "0");
                d3.selectAll(".mouse-per-line text").style("opacity", "0");
                d3.selectAll("#tooltip").style('display', 'none').empty();

            })
            .on('mouseover', function () {
                d3.select(".mouse-line").style("opacity", "1");
                d3.selectAll(".mouse-per-line circle").style("opacity", "1");
                d3.selectAll("#tooltip").style('display', 'block').empty();
            })
            .on('mousemove', function () {
                
                const mouse = d3.mouse(this);
                let id = 0;

                d3.selectAll(".mouse-per-line")
                    .attr("transform", (d, i) => {

                        const xDate = scope.x.invert(mouse[0]);
                        const bisect = d3.bisector(d => { return d.x; }).left;
                        id = bisect(d.values, xDate) - 1;

                        d3.select(".mouse-line")
                            .attr("d", () => {

                                let tmpData = "M" + scope.x(d.values[id].x) + "," + (scope.height);
                                tmpData += " " + scope.x(d.values[id].x) + "," + 0;
                                return tmpData;
                            });
                        return "translate(" + scope.x(d.values[id].x) + "," + scope.y(d.values[id].y) + ")";
                    });

                d3.selectAll("#tooltip").html('');
                scope._updateTooltip(data, id);

            })
    }

    /**
     * Updates text inside tooltip.
     * @param {*} mouse 
     * @param {*} data 
     * @param {*} id
     */
    _updateTooltip(data, id) {

        const mousePos = d3.transform(d3.select(".mouse-per-line").attr("transform")).translate;
        const scope = this;
        const parseDate = d3.time.format("%m.%Y");

        this.tooltip
            .html(() => {
                return 'Za <b>' + parseDate(data[0].values[id].x) + '</b>:<br>';
            })
            .style('display', 'block')
            .style('left', (mousePos[0] + 100 >= scope.width ? mousePos[0] - 100 : mousePos[0] + 50) + 'px')
            .style('top', (scope.height + mousePos[1] <= 270 ? 300 : scope.height + mousePos[1]) + 'px')
            .style('font-size', 12)
            .style('text-align', 'left')
            .style("background", "#ffffff")
            .style("border", "1px solid #3d3e40")
            .style("padding", "8px")
            .append('div')
            .style('font-size', 10)
            .html(() => {

                let string = "";
                data.forEach(d => {

                    string += "<u>" + d.key + "</u>: " + Math.round((d.values[id].y + Number.EPSILON) * 100) / 100 + " µg/m3<br>"; 
                });
                return string;                
            });
    }

    /**
     * Creates and shows grap legend.
     * @param {*} data 
     */
    _createLegend(data) {

        const svgLegend = this.svg.append('g')
            .attr('class', 'gLegend')
            .attr("transform", "translate(" + 0 + "," + (this.height + this.margin.bottom - 15) + ")");

        const legend = svgLegend.selectAll('.legend')
            .data(data)
            .enter().append('g')
            .attr("class", "legend")
            .attr("transform", function (d, i) {return "translate(" + i * 64 + ",0)"});

        legend.append("circle")
            .attr("class", "legend-node")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 6)
            .style("fill", d => this.color(d.key));

        legend.append("text")
            .attr("class", "legend-text")
            .attr("x", 12)
            .attr("y", 3)
            .style("fill", "#A9A9A9")
            .style("font-size", 12)
            .text(d => d.key);
    }
}