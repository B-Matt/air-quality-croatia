class Stations {

    constructor(width, height) {

        this.slider = null;
        this.sliderValue = 1;

        this.dates = null;
        this.stations = null;
        this.graph = new Graph(400, 200, {top: 30, right: 20, bottom: 60, left: 30});

        this.projectCircles = d3.geo.mercator()
            .center([16.52, 44.415])
            .scale(6000)
            .translate([width / 2, height / 2]);

        this.pollutant = "all";
    }

    /**
     * Loads stations from station_data.json file.
     * @param svg
     */
    loadStations(svg) {

        this.svg = svg;
        const scope = this;
        d3.json("station_data.json", function (error, stations) {

            scope._loadStationsData().then((data) => {

                for (let i = 0; i < stations.length; i++) {
                    stations[i]["indexes"] = data[stations[i]["id"]].indexes;
                    stations[i]["rest_data"] = data[stations[i]["id"]].rest_data;
                }

                scope.dates = data.dates;
                scope.stations = stations;

                scope._showSlider();
                scope._drawStations();
                scope._colorizeStations(0);
            });
        });
    }

    /**
     * Animates changing color of station markers on map.
     */
    animate() {

        const scope = this;
        this.sliderTimer = setInterval(() => {

            const nextValue = (scope.sliderValue + 1) % scope.dates.length;
            scope.slider.setValue(nextValue);
        }, 1000);
    }

    /**
     * Updates map when pollutant type changes in the filter settings.
     */
    update(sliderValue) {

        if(sliderValue == undefined) {
            sliderValue = this.sliderValue - 1;
        }

        this.svg.selectAll("circle").remove();
        this._drawStations(sliderValue);
        this._colorizeStations(sliderValue);
    }

    /**
     * Returns max value of the slider.
     */
    getMaxSliderValue() {
        return this.dates.length - 1;
    }

    /**
     * Draws stations on map.
     * @param {*} dateIndex
     */
    _drawStations(dateIndex) {

        if(dateIndex == undefined) {
            dateIndex = this.sliderValue - 1;
        }

        const tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .style("background", "#ffffff")
            .style("border", "1px solid #3d3e40")
            .style("padding", "8px")
            .text("");

        const scope = this;
        const station = this.svg.selectAll("circle")
            .data(this.stations)
            .enter()
            .append("circle")
            .attr("cx", (d) => {
                return scope.projectCircles([d.location[1], d.location[0]])[0];
            })
            .attr("cy", (d) => {
                return scope.projectCircles([d.location[1], d.location[0]])[1];
            })
            .attr("r", 10 / mapScale)
            .attr("fill", (d) => {
                return "gray";
            })
            .attr("opacity", 0.7)
            .style("stroke", "black")
            .style("stroke-width", 1 / mapScale)
            .style("stroke-opacity", 1)
            .attr("class", "aq-stat-icon")
            .on("mouseover", (d) => {
                station.style("cursor", "pointer");
                tooltip.text(d.name);
                return tooltip.style("visibility", "visible");
            })
            .on("mousemove", () => {
                return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
            })
            .on("mouseout", () => {
                return tooltip.style("visibility", "hidden");
            })
            .on("click", (d) => {
                
                $(".aq-stat").show();               

                $("#aq-stat-id").text(d.id);
                $("#aq-stat-network").text(d.network);
                $("#aq-stat-name").text(d.name);
                $("#aq-stat-date").text(scope.dates[dateIndex]);

                const quality_index = d.indexes[scope.pollutant][dateIndex];

                if (quality_index == 0) {
                    $("#aq-stat-index").text("Dobro").css("background-color", "#55EFE5");
                } else if (quality_index == 1) {
                    $("#aq-stat-index").text("Prihvatljivo").css("background-color", "#54CAAA");
                } else if (quality_index == 2) {
                    $("#aq-stat-index").text("Umjereno").css("background-color", "#EFE558");
                } else if (quality_index == 3) {
                    $("#aq-stat-index").text("Loše").css("background-color", "#FE5355");
                } else if (quality_index == 4) {
                    $("#aq-stat-index").text("Vrlo loše").css("background-color", "#940D36"); 
                } else if (quality_index == 5) {
                    $("#aq-stat-index").text("Izuzetno loše").css("background-color", "#7D2181");
                } else {
                    $("#aq-stat-index").text("Nema dovoljno podataka").css("background-color", "gray");
                }

                scope.graph.show(d, scope.dates);
                scope.clickedStation = d;               
                return;
            });
    }

    /**
     * Colorize station markers based on current dataIndex.
     * @param {Integer} dateIndex 
     */
    _colorizeStations(dateIndex) {

        const scope = this;
        this.svg.selectAll("circle")
            .data(this.stations)
            .attr("fill", (d) => {
                
                const quality_index = d.indexes[scope.pollutant][dateIndex];
                if (quality_index == 0) {
                    return "#55EFE5";
                } else if (quality_index == 1) {
                    return "#54CAAA";
                } else if (quality_index == 2) {
                    return "#EFE558";
                } else if (quality_index == 3) {
                    return "#FE5355";
                } else if (quality_index == 4) {
                    return "#940D36";
                } else if (quality_index == 5) {
                    return "#7D2181";
                }
                return "gray";
            })
            .attr("opacity", 0.7)
            .style("stroke", "black")
            .style("stroke-width", 1 / mapScale)
            .style("stroke-opacity", 1);
    }

    /**
     * Updates station data in station info tab
     * @param {Integer} dateIndex 
     */
    _updateStationData(dateIndex) {

        const d = this.clickedStation;
        if(d === undefined) {
            return;
        }

        $("#aq-stat-id").text(d.id);
        $("#aq-stat-network").text(d.network);
        $("#aq-stat-name").text(d.name);
        $("#aq-stat-date").text(this.dates[dateIndex]);

        const quality_index = d.indexes[this.pollutant][dateIndex];

        if (quality_index == 0) {
            $("#aq-stat-index").text("Dobro").css("background-color", "#55EFE5");
        } else if (quality_index == 1) {
            $("#aq-stat-index").text("Prihvatljivo").css("background-color", "#54CAAA");
        } else if (quality_index == 2) {
            $("#aq-stat-index").text("Umjereno").css("background-color", "#EFE558");
        } else if (quality_index == 3) {
            $("#aq-stat-index").text("Loše").css("background-color", "#FE5355");
        } else if (quality_index == 4) {
            $("#aq-stat-index").text("Vrlo loše").css("background-color", "#940D36"); 
        } else if (quality_index == 5) {
            $("#aq-stat-index").text("Izuzetno loše").css("background-color", "#7D2181");
        } else {
            $("#aq-stat-index").text("Nema dovoljno podataka").css("background-color", "gray");
        }   
    }

    /**
     * Shows d3 slider for changing dateIndex variable.
     */
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
                    scope._updateStationData(value - 1);
                    scope.sliderValue = value;
                }
                $("#aq-dates-sm").text(scope.dates[value - 1]);
            });

        this.slider = slider;
        d3.select('#slider').call(slider);
    }

    /**
     * Loads air quality index from API.
     */
    async _loadStationsData() {

        const date = new Date();
        const fromDate = date.getDate() + "." + (date.getMonth() + 1) + "." + (date.getFullYear() - 1);
        const toDate = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
        const url = `http://localhost/air-quality-croatia/api/api.php?from=${fromDate}&to=${toDate}`;

        let response = await fetch(url, {
            cache: "force-cache"
        });
        let data = await response.json()
        return data;
    }
}