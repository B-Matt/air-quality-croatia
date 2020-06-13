class Map {

    constructor() {

        this.width = 1200;
        this.height = 720;
        
        this.projection = d3.geo.mercator()
            .center([0, 10])
            .scale(6000)
            .translate([17600, 4500])
            .rotate([-180, 0]);
        
        this.path = d3.geo.path()
            .projection(this.projection);
        
        this.svg = d3.select("body").append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("background", "white")
            .style("position", "relative")
            .style("left", "50%")
            .style("transform", "translate(-50%, 15%)");
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