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

            scope._loadStationsData().then((data) => {

                for(let i = 0; i < stations.length; i++)
                {
                    stations[i]["indexes"] = data[stations[i]["id"]].indexes;
                }

                svg.selectAll("circle")
                    .data(stations)
                    .enter()
                    .append("circle")
                    .attr("cx", (d) => { return scope.projectCircles([d.location[1], d.location[0]])[0]; })
                    .attr("cy", (d) => { return scope.projectCircles([d.location[1], d.location[0]])[1]; })
                    .attr("r", "10px")
                    .attr("fill", (d) => {

                        const quality_index = d.indexes[0];
                        if(quality_index == 0) {
                            return "#55EFE5";
                        }
                        else if(quality_index == 1) {
                            return "#54CAAA";
                        }
                        else if(quality_index == 2) {
                            return "#EFE558";
                        }
                        else if(quality_index == 3) {
                            return "#FE5355";
                        }
                        else if(quality_index == 4) {
                            return "#7D2181";
                        }
                        return "gray";
                    })
                    .attr("opacity", 0.7)
                    .style("stroke", "black")
                    .style("stroke-width", 1)
                    .style("stroke-opacity", 1);
            });
        });
    }

    async _loadStationsData() {

        const date = new Date();
        const fromDate = date.getDate() + "." + (date.getMonth() + 1) + "." + (date.getFullYear() - 1);
        const toDate = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
        //const url = `https://themastergames.com/ferit/air/api/api.php?from=${fromDate}&to=${toDate}`;
        const url = './test_data.json';
        
        let response = await fetch(url, {cache: "force-cache"});
        let data = await response.json()
        return data;
    }
}