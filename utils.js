var base_url = 'https://gisviewer.jerusalem.muni.il/ArcGIS/rest/services/Ortho2019/MapServer/tile'
var level = 7
var x = 95772
var y = 83034

function up(){
    x = x-1
    updateImage()
}

function left(){
    y = y-1
    updateImage()
}

function right(){
    y = y+1
    updateImage()
}

function down(){
    x = x+1
    updateImage()
}

function updateImage(){
    var img_url = [base_url, level, x, y].join('/')
    document.getElementById('tile').src = img_url
}

