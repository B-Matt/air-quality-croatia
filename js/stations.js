class Stations {

    constructor(size) {

        this.projectCircles = d3.geo.mercator()
            .center([17.7, 44.3])
            .scale(6000)
            .translate([size[0] / 2, size[1] / 2]);
    }

    loadStations(svg) {
    
        const scope = this;
        d3.json("station_data.json", function (error, stations) {

            let stationLocations = [];
            stations.forEach((station, i) => {
        
                stationLocations.push([station["location"][1], station["location"][0]]);
            });
    
            svg.selectAll("circle")
                .data(stationLocations)
                .enter()
                .append("circle")
                .attr("cx", (d) => { return scope.projectCircles(d)[0]; })
                .attr("cy", (d) => { return scope.projectCircles(d)[1]; })
                .attr("r", "10px")
                .attr("fill", "yellow")
                .attr("opacity", 0.6)
                .style("stroke", "black")
                .style("stroke-width", 1)
                .style("stroke-opacity", 1);
        });
    }
}