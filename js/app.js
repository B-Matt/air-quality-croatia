const width = 1200;
const height = 720;

const projection = d3.geo.mercator()
    .center([0, 10])
    .scale(6000)
    .translate([17600, 4500])
    .rotate([-180, 0]);

const projectCircles = d3.geo.mercator()
    .center([17.7, 44.3])
    .scale(6000)
    .translate([width / 2, height / 2]);

const path = d3.geo.path()
    .projection(projection);

var geoJSON = {};

const svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "white")
    .style("position", "relative")
    .style("left", "50%")
    .style("transform", "translate(-50%, 15%)");

d3.json("cro_regv3.json", function (error, o) {

    const data = topojson.feature(o, o.objects.layer1);
    svg.selectAll("path.county")
        .data(data.features)
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("id", function (d) {
            return d.id;
        })
        .attr("d", path).style("fill", "#778ba1")
        .style("stroke", "white")
        .style("stroke-width", 1)
        .style("stroke-opacity", 1);

    d3.json("station_data.json", function (error, stations) {

        let stationLocations = [];
        stations.forEach((station, i) => {
    
            stationLocations.push([station["location"][1], station["location"][0]]);
        });

        svg.selectAll("circle")
            .data(stationLocations)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return projectCircles(d)[0]; })
            .attr("cy", function (d) { return projectCircles(d)[1]; })
            .attr("r", "10px")
            .attr("fill", "yellow")
            .attr("opacity", 0.6)
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("stroke-opacity", 1);
    });
});