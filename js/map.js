class Map {

    constructor(width, height) {

        this.projection = d3.geo.mercator()
            .center([0, 10])
            .scale(6000)
            .translate([17600, 4500])
            .rotate([-180, 0]);

        this.path = d3.geo.path()
            .projection(this.projection);

        this.zoom = d3.behavior.zoom()
            .translate(this.projection.translate())
            .scale(this.projection.scale())
            .scaleExtent([1, 8])
            .on("zoom", this._updateMap);

        this.svg = d3.select("#map").append("svg")
            .attr("viewBox", "0 0 " + width + " " + height)
            .call(this.zoom);
    }

    loadMap(callback) {

        const scope = this;
        d3.json("cro_regv3.json", (error, o) => {

            scope.data = topojson.feature(o, o.objects.layer1);
            scope.svg.selectAll("path.county")
                .data(scope.data.features)
                .enter()
                .append("path")
                .attr("class", "county")
                .attr("id", (d) => {
                    return d.id;
                })
                .attr("d", scope.path).style("fill", "#778ba1")
                .style("stroke", "white")
                .style("stroke-width", 1)
                .style("stroke-opacity", 1);
            
            callback();
        });
    }

    getSvg() {
        return this.svg;
    }

    _updateMap() {

        const svg = d3.select("svg");
        svg.selectAll("path")
            .attr("transform", "translate(" + d3.event.translate.join(",") + ")" + " scale(" + d3.event.scale + ")");
        
        svg.selectAll("circle")
            .attr("transform", "translate(" + d3.event.translate.join(",") + ") scale(" + d3.event.scale + ")")
            .transition()
            .attr("r", 10 / d3.event.scale)
            .style("stroke-width", 1 / d3.event.scale);
    }
}