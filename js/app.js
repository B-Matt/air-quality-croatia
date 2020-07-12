const mapSizes = [960, 700];
let mapScale = 1;

const map = new Map(mapSizes[0], mapSizes[1]);
const stations = new Stations(mapSizes[0], mapSizes[1]);

map.loadMap(() => {
    stations.loadStations(map.getContainer())
});

$(document).ready(() => {

    const date = new Date();
    const fromDate = date.getDate() + '.' + (date.getMonth() + 1) + '.' + (date.getFullYear() - 1);
    const toDate = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();

    $('#aq-realtime-data .title').html('Prikaz podataka za <b>' + toDate + '</b>');
    $('#aq-range-data .title').html('Prikaz podataka za <b>' + fromDate + ' - ' + toDate + '</b>');
    $('#aq-range-data').hide();
    $('#aq-subtitle').html('Prikaz podataka za <b>' + fromDate + ' - ' + toDate + '</b>');

    // Buttons
    $('#animate-button').click((e) => {
        
        e.preventDefault();
        stations.animate();

        $('#animate-button').hide();
        $('#pause-button').show();
    });

    $('#pause-button').click((e) => {
        
        e.preventDefault();
        clearInterval(stations.sliderTimer);

        $('#pause-button').hide();
        $('#animate-button').show();
    });

    $('#aq-realtime-data-btn').click((e) => {
        
        e.preventDefault();

        $('#aq-range-data').show();
        $('#aq-realtime-data').hide();
        $('#aq-timeline').hide();

        $('#aq-subtitle').html('Prikaz podataka za <b>' + toDate + '</b>');
        stations.update(stations.getMaxSliderValue());
    });
    
    $('#aq-range-data-btn').click((e) => {
        
        e.preventDefault();

        $('#aq-realtime-data').show();
        $('#aq-timeline').show();
        $('#aq-range-data').hide();

        $('#aq-subtitle').html('Prikaz podataka za <b>' + fromDate + ' - ' + toDate + '</b>');
        stations.update();
    });

    // Rest UI
    $('#aq-pollutant-type').on('change', () => {

        stations.pollutant = $('#aq-pollutant-type :selected').val();
        stations.update();
    });

    $(document).mouseup((e) => {

        if ($(e.target).closest('.aq-stat-icon').length === 0) { 
            
            $('.aq-stat').hide();
            stations.graph.hide();
        }
    });
});