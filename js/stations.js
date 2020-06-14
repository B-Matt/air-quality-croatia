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

            let requests = stations.reduce((promiseChain, item) => {
                return promiseChain.then(() => new Promise((resolve) => {
                    scope._averageData(item, resolve);
                }));
            }, Promise.resolve());

            requests.then(() => {

                svg.selectAll("circle")
                    .data(stations)
                    .enter()
                    .append("circle")
                    .attr("cx", (d) => { return scope.projectCircles([d.location[1], d.location[0]])[0]; })
                    .attr("cy", (d) => { return scope.projectCircles([d.location[1], d.location[0]])[1]; })
                    .attr("r", "10px")
                    .attr("fill", (d) => {

                        if(d.mes.pm25 > 0) {
                            return "#55EFE5";
                        }
                        else if(d.mes.pm25 >= 10) {
                            return "#54CAAA";
                        }
                        else if(d.mes.pm25 >= 20) {
                            return "#EFE558";
                        }
                        else if(d.mes.pm25 >= 20) {
                            return "#FE5355";
                        }
                        else if(d.mes.pm25 >= 20) {
                            return "#7D2181";
                        }
                        return "gray";
                    })
                    .attr("opacity", 0.6)
                    .style("stroke", "black")
                    .style("stroke-width", 1)
                    .style("stroke-opacity", 1);
            });
        });
    }

    async _averageData(station, callback) {

        this._loadStationData(station["id"]).then((data) => {

            station["mes"] = data;
            callback();
        });
    }

    async _loadStationData(id) {

        const date = new Date();
        const fromDate = date.getDate() + "." + (date.getMonth() + 1) + "." + (date.getFullYear() - 1);
        const toDate = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
        //const url = `https://themastergames.com/ferit/air/api.php?id=${id}&from=${fromDate}&to=${toDate}`;
        const url = './test_data.json';
        
        let response = await fetch(url);
        let data = await response.json()
        return data;
    }
}