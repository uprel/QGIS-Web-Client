var gis_projects = {
    "path": "",
    "mapserver": "/wms",
    "thumbnails": "/thumbnails",
    "title": "QGIS Mapserver demo",
    "topics": [{
        "name": "Europe basic",
        "projects": [{
            "name": "Europe basic", //name needs to correspond with the project title (Project Properties --> General --> Project Title)
            "projectpath": "",
            "projectfile": "eu_demo",
            "thumbnail": "eu_demo.png",
            "format": "image/png",
            "visibleLayers": "airports,pop_places,roads,urban_area,municipality,country",
            /*
             // optional WMTS base layers (when using enableWmtsBaseLayers), omit or set null for none
             "wmtsLayers": [
             {
             // this WMS layer will be used for printing, feature info, legend and metadata
             "wmsLayerName": "Country",
             // WMTS base layer config
             "wmtsConfig": {
             "name": "OpenGeo Countries",
             "url": "http://v2.suite.opengeo.org/geoserver/gwc/service/wmts/",
             "layer": "opengeo:countries",
             "matrixSet": "EPSG:900913",
             "matrixIds": ["EPSG:900913:0", "EPSG:900913:1", "EPSG:900913:2", "EPSG:900913:3", "EPSG:900913:4", "EPSG:900913:5", "EPSG:900913:6", "EPSG:900913:7", "EPSG:900913:8", "EPSG:900913:9", "EPSG:900913:10", "EPSG:900913:11", "EPSG:900913:12", "EPSG:900913:13", "EPSG:900913:14", "EPSG:900913:15", "EPSG:900913:16", "EPSG:900913:17", "EPSG:900913:18", "EPSG:900913:19", "EPSG:900913:20", "EPSG:900913:21", "EPSG:900913:22", "EPSG:900913:23", "EPSG:900913:24", "EPSG:900913:25"],
             "format": "image/png",
             "style": "_null",
             "opacity": 0.7
             }
             }
             ],
             */
            "updateInterval": "none",
            "responsible": "level2 team",
            "tags": "europe,demo,basic"
        }]
    },{
        "name": "Europe statistic",
        "projects": [{
            "name": "Europe statistic", //name needs to correspond with the project title (Project Properties --> General --> Project Title)
            "projectpath": "",
            "projectfile": "eu_stat",
            "thumbnail": "eu_stat.png",
            "format": "image/png",
            "visibleLayers": "country,population density",
            "updateInterval": "none",
            "responsible": "level2 team",
            "tags": "europe,demo,population density"
        }]
    }]
};