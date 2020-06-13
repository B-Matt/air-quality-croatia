const map = new Map();
const stations = new Stations(map.getSize());

map.loadMap(() => {
    stations.loadStations(map.getSvg())
});