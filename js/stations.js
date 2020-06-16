class Stations {

    constructor(size) {

        this.slider = null;
        this.sliderValue = 1;

        this.dates = null;
        this.stations = null;

        this.projectCircles = d3.geo.mercator()
            .center([16.55, 44.38])
            .scale(6000)
            .translate([size[0] / 2, size[1] / 2]);
    }

    loadStations(svg) {

        this.svg = svg;
        const scope = this;
        d3.json("station_data.json", function (error, stations) {

            scope._loadStationsData().then((data) => {

                for (let i = 0; i < stations.length; i++) {
                    stations[i]["indexes"] = data[stations[i]["id"]].indexes;
                }
                data.dates[13] = 0;
                
                scope.dates = data.dates;
                scope.stations = stations;

                scope._showSlider();
                scope._drawStations();
                scope._colorizeStations(0);
            });
        });
    }

    animate() {

        const scope = this;
        this.sliderTimer = setInterval(() => {

            const nextValue = (scope.sliderValue + 1) % scope.dates.length;
            scope.slider.setValue(nextValue);
        }, 1000);
    }

    _drawStations() {

        this.svg.selectAll("circle")
            .data(this.stations)
            .enter()
            .append("circle")
            .attr("cx", (d) => {
                return this.projectCircles([d.location[1], d.location[0]])[0];
            })
            .attr("cy", (d) => {
                return this.projectCircles([d.location[1], d.location[0]])[1];
            })
            .attr("r", "10px")
            .attr("fill", (d) => {
                return "gray";
            })
            .attr("opacity", 0.7)
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("stroke-opacity", 1);
    }

    _colorizeStations(dateIndex) {

        this.svg.selectAll("circle")
            .data(this.stations)
            .attr("fill", (d) => {

                const quality_index = d.indexes[dateIndex];
                if (quality_index == 0) {
                    return "#55EFE5";
                } else if (quality_index == 1) {
                    return "#54CAAA";
                } else if (quality_index == 2) {
                    return "#EFE558";
                } else if (quality_index == 3) {
                    return "#FE5355";
                } else if (quality_index == 4) {
                    return "#7D2181";
                }
                return "gray";
            })
            .attr("opacity", 0.7)
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("stroke-opacity", 1);
    }

    _showSlider() {

        $("#aq-dates-sm").text(this.dates[this.sliderValue - 1]);

        const scope = this;
        const slider = d3.slider()
            .min(1)
            .max(scope.dates.length - 1)
            .ticks(10)
            .stepValues(Object.keys(scope.dates))
            .value(parseInt(scope.sliderValue))
            .callback(() => {

                const value = parseInt(slider.value());
                if (value != scope.sliderValue) {

                    scope._colorizeStations(value - 1);
                    scope.sliderValue = value;
                }
                $("#aq-dates-sm").text(scope.dates[value - 1]);
            });

        this.slider = slider;
        d3.select('#slider').call(slider);
    }

    async _loadStationsData() {

        const date = new Date();
        const fromDate = date.getDate() + "." + (date.getMonth() + 1) + "." + (date.getFullYear() - 1);
        const toDate = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
        //const url = `https://themastergames.com/ferit/air/api/api.php?from=${fromDate}&to=${toDate}`;
        const url = './test_data.json';

        let response = await fetch(url, {
            cache: "force-cache"
        });
        let data = await response.json()
        return data;
    }
}