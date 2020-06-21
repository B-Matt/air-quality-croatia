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
            .scaleExtent([1, 8])
            .on("zoom", this._updateMap);

        this.svg = d3.select("#map").append("svg")            
            .attr("viewBox", [0, 0, width, height]);

        this.g = this.svg.append("g");
    }

    /**
     * Loads map from JSON file and draws map segments on SVG.
     * @param {*} callback 
     */
    loadMap(callback) {

        const scope = this;
        d3.json("cro_regv3.json", (error, o) => {

            scope.data = topojson.feature(o, o.objects.layer1);
            scope.g.selectAll("path.county")
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
            
            scope.svg.call(scope.zoom);
            callback();
        });
    }

    /**
     * Returns SVG element.
     */
    getContainer() {
        return this.g;
    }

    /**
     * Updates map translation and scale when user zooms/pans map.
     */
    _updateMap() {

        const g = d3.select("g");
        g.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
        
        g.selectAll("circle")
            .transition()
            .attr("r", 10 / d3.event.scale)
            .style("stroke-width", 1 / d3.event.scale);

        mapScale = d3.event.scale;
    }
}