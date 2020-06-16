class Map {

    constructor() {

        this.width = 960;
        this.height = 700;
        
        this.projection = d3.geo.mercator()
            .center([0, 10])
            .scale(6000)
            .translate([17600, 4500])
            .rotate([-180, 0]);
        
        this.path = d3.geo.path()
            .projection(this.projection);
        
        this.svg = d3.select("#map").append("svg")
            .attr("viewBox", "0 0 " + this.width + " " + this.height);
    }

    loadMap(callback) {

        d3.json("cro_regv3.json", (error, o) => {
            const data = topojson.feature(o, o.objects.layer1);
            this.svg.selectAll("path.county")
                .data(data.features)
                .enter()
                .append("path")
                .attr("class", "county")
                .attr("id", (d) => {
                    return d.id;
                })
                .attr("d", this.path).style("fill", "#778ba1")
                .style("stroke", "white")
                .style("stroke-width", 1)
                .style("stroke-opacity", 1);
            callback();
        });
    }

    getSvg() {
        return this.svg;
    }

    getSize() {
        return [this.width, this.height];
    }
}