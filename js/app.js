const width = 960;
const height = 700;
const projection = d3.geo.mercator()
    .center([0, 10])
    .scale(6000)
    .translate([17600, 4500])
    .rotate([-180, 0]);

const path = d3.geo.path()
    .projection(projection);

const svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "white")
    .style("position", "relative")
    .style("left", "50%")
    .style("transform", "translate(-50%, 15%)");

d3.json("cro_regv3.json", function (error, cro) {

    const data = topojson.feature(cro, cro.objects.layer1);
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
});