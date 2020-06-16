const map = new Map();
const stations = new Stations(map.getSize());

map.loadMap(() => {
    stations.loadStations(map.getSvg())
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
    })
});
