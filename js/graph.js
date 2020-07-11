class Graph {

    constructor(width, height, margin) {

        this.isShown = false;

        this.width = width - margin.left - margin.right;
        this.height = height - margin.top - margin.bottom;

        this.svg = d3.select("#aq-stat-graph-wrapper")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        this.y = d3.scale.linear()					
            .range([this.height, 0]);

        this.x = d3.time.scale()                    
            .range([0, this.width + 50]);

        this.yAxis = d3.svg.axis()
            .orient("left")
            .scale(this.y);
            
        this.xAxis = d3.svg.axis()
            .orient("bottom")
            .scale(this.x)
            .ticks(d3.time.months)
            .tickSize(10, 0)
            .tickFormat(d3.time.format("%b %y"));

        const scope = this;
        this.line = d3.svg.line()
            .x(d => { return scope.x(d.x); })
            .y(d => { return scope.y(d.y); });
    }

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
        
        const res = sumstat.map(d => { return d.key })
        const color = d3.scale.category20()

        this.svg.append("g")
            .attr("class", "axis x")
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis);
            
        this.svg.append("g")
            .attr("class", "axis y")
            .call(this.yAxis);

        this.svg.append("g")            
            .attr("class", "grid")
            .call(this._makeGridAxis()
                .tickSize(-this.width - 50, 0, 0)
                .tickFormat("")
            );

        this.svg
            .data(sumstat)
            .enter()
            .append("path")
            .attr("class", "signal")
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1)
            .attr("d", d => {
                return d3.svg.line()
                    .x(scope.x(1))
                    .y(10)
            });

        this.svg.selectAll(".line")
            .data(sumstat)
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", d => { return color(d.key) })
            .attr("stroke-width", 3)
            .attr("opacity", d => { console.log(d); return 1; })
            .attr("d", d => {

                return d3.svg.line()
                    .x(d => { return scope.x(d.x); })
                    .y(d => { return scope.y(d.y); })
                    .defined(d => { return d.y; })
                    (d.values)
            });

        const item = d3.select("#aq-stat-graph-legend")
            .selectAll('div')
            .data(sumstat)
            .enter()
            .append('div')
            .attr('class', 'legend-item');

        item.append('div')
            .attr('class', 'legend-item--color')
            .style('background-color', (d, i) => color(d.key));

        item.append('h3')
            .attr('class', 'legend-item--header')
            .text(d => d.key);

        $("#aq-stat-graph").fadeIn();
        this.isShown = true;
    }

    hide() {

        this.isShown = false;
        $("#aq-stat-graph svg g").empty();
        $("#aq-stat-graph").hide();
    }

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

    _makeGridAxis() {
        return d3.svg.axis()
            .scale(this.y)
            .orient("left")
    }
}