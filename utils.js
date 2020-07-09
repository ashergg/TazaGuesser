var base_url = 'https://gisviewer.jerusalem.muni.il/ArcGIS/rest/services/Ortho2019/MapServer/tile'
var level = 7
var x = 83034
var y = 95772

function up(){
    y = y-1
    updateImage()
}

function left(){
    x = x-1
    updateImage()
}

function right(){
    x = x+1
    updateImage()
}

function down(){
    y = y+1
    updateImage()
}

function updateImage(){
    var img_url = [base_url, level, y, x].join('/')
    document.getElementById('tile').src = img_url
}

function random_coord(extent){
    range_x = extent["xmax"]-extent["xmin"]
    range_y = extent["ymax"]-extent["ymin"]
    var coord = new Object
    coord.x = extent["xmin"] + Math.random()*range_x
    coord.y = extent["ymin"] + Math.random()*range_y
    return coord
}

function calc_tiles(coord, origin, scale){
    var tile = new Object
    tile.x = calc_tile(coord.x, origin["x"], scale)
    tile.y = calc_tile(coord.y, origin["y"], scale)
    return tile
}

function calc_tile(coord, origin, scale){
    res = coord - origin
    if (res < 0){
        res = res * -1
    }
    res = res/scale
    res = res/0.0254
    res = res*96
    res = res/256
    return Math.floor(res)
}

var json_path = "https://gisviewer.jerusalem.muni.il/ArcGIS/rest/services/Ortho2019/MapServer/?f=json";
var data = new Object
var xhttp = new XMLHttpRequest()
xhttp.onreadystatechange = function(){
    if (this.readyState == 4 && this.status == 200){
        data = JSON.parse(this.responseText)
        var scale = data["tileInfo"]["lods"][level]["scale"]
        coord = random_coord(data["fullExtent"])
        tile = calc_tiles(coord, data["tileInfo"]["origin"], scale)
        x = tile.x
        y = tile.y
        updateImage()
        setMap(data, coord)
    }
}

xhttp.open("GET", json_path, true)
xhttp.send()


function setMap(data, coord){
    require([
        "esri/Map",
        "esri/views/MapView",
        "esri/geometry/Extent",
        "esri/geometry/Point",
        "esri/geometry/SpatialReference",
        "esri/geometry/projection",
        "esri/Graphic",
        "esri/layers/GraphicsLayer",
    ], function(Map, MapView, Extent, Point, SpatialReference,
         projection, Graphic, GraphicsLayer) {
        const wsg = new SpatialReference({wkid:102100});
        const itm = new SpatialReference({wkid:2039});

        var isrExt = Extent.fromJSON(data["fullExtent"]);

        var isrPoint = new Point({
            x: coord.x,
            y: coord.y,
            spatialReference: itm
        });

        var graphicsLayer = new GraphicsLayer()

        var map = new Map({
            basemap: "osm"
        });

        projection.load().then(function(){
            var ext = projection.project(isrExt, wsg);
            var view = new MapView({
                container: "map01",
                map: map,
                extent: ext,
                zoom: 12
            });
            view.on("click", function(event){
                var origPoint = projection.project(isrPoint, wsg);
                var guessedPoint = event.mapPoint;
                var flagSymbol = {
                    type: "picture-marker",
                    url: "https://ashergg.github.io/TazaGuesser/race_flag.png",
                    height: 20,
                    width: 20,
                    xoffset: 8,
                    yoffset: 10
                }
                var pinSymbol = {
                    type: "picture-marker",
                    url: "https://ashergg.github.io/TazaGuesser/red_pin.png",
                    height: 20,
                    width: 20,
                    yoffset: 10
                }
                var pointGraphicOrig = new Graphic({
                    geometry: origPoint,
                    symbol: flagSymbol
                });
                var pointGraphicGuess = new Graphic({
                    geometry: guessedPoint,
                    symbol: pinSymbol
                });

                var polyline = {
                    type: "polyline",
                    paths: [
                        [origPoint.x, origPoint.y],
                        [guessedPoint.x, guessedPoint.y]
                    ],
                    spatialReference: wsg
                };

                var lineSymbol = {
                    type: "simple-line",
                    style: "dash"
                }

                var polylineGraphic = new Graphic({
                    geometry: polyline,
                    symbol: lineSymbol
                });

                graphicsLayer.add(pointGraphicOrig);
                graphicsLayer.add(pointGraphicGuess);
                graphicsLayer.add(polylineGraphic);
                map.add(graphicsLayer);
                view.goTo({
                    target: [guessedPoint, origPoint]
                })
            })

        });
    });
}