const mapSizes = [960, 700];
let mapScale = 1;

const map = new Map(mapSizes[0], mapSizes[1]);
const stations = new Stations(mapSizes[0], mapSizes[1]);

map.loadMap(() => {
    stations.loadStations(map.getContainer())
});

$(document).ready(() => {

    const date = new Date();
    const fromDate = date.getDate() + "." + (date.getMonth() + 1) + "." + (date.getFullYear() - 1);
    const toDate = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
    $("#aq-dates").html(fromDate + " - " + toDate);

    // Buttons
    $("#animate-button").click((e) => {
        
        e.preventDefault();
        stations.animate();

        $("#animate-button").hide();
        $("#pause-button").show();
    });

    $("#pause-button").click((e) => {
        
        e.preventDefault();
        clearInterval(stations.sliderTimer);

        $("#pause-button").hide();
        $("#animate-button").show();
    });

    $(document).mouseup((e) => {

        if ($(e.target).closest(".aq-stat-icon").length === 0) { 
            $(".aq-stat").hide();
        }
    });
});
