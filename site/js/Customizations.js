// customInit() is called before any map initialization
function customInit() {

     // I create a new control click event class
     OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
         defaultHandlerOptions: {
                 'single': true,
                 'double': false,
                 'pixelTolerance': 0,
                 'stopSingle': false,
                 'stopDouble': false
         },
         initialize: function(options) {
                 this.handlerOptions = OpenLayers.Util.extend(
                         {}, this.defaultHandlerOptions
                 );
                 OpenLayers.Control.prototype.initialize.apply(
                         this, arguments
                 );
                 this.handler = new OpenLayers.Handler.Click(
                         this, {
                                 'click': this.trigger
                         }, this.handlerOptions
                 );
         }
     });
}

// called before map initialization
function customBeforeMapInit() {

    //open tables for layers from db setting
    //tabs for this tables cannot be closed and are marked for editing
    //only fields checked as WFS in qgis project
    for (var j=0; j < tablesOnStart.length;j++) {
        var myLayerName = tablesOnStart[j];

        if (wmsLoader.projectSettings.capability.layerDrawingOrder.indexOf(myLayerName)>=0) {
            var layer = new QGIS.SearchPanel({
                useWmsRequest: true,
                queryLayer: myLayerName,
                gridColumns: getLayerAttributes(myLayerName),
                gridLocation: 'bottom',
                gridTitle: myLayerName,
                gridResults: 2000,
                gridResultsPageSize: 20,
                gridEditable: true,
                selectionLayer: myLayerName,
                formItems: [],
                doZoomToExtent: true,
                tabClosable: false
            });
            layer.onSubmit();
            layer.on("featureselected", showFeatureSelected);
            layer.on("featureselectioncleared", clearFeatureSelected);
            layer.on("beforesearchdataloaded", showSearchPanelResults);
        }
    }

}

// called after map initialization
function customAfterMapInit() {

     // Create a new map control based on Control Click Event
     StreetViewControl = new OpenLayers.Control.Click( {
         trigger: function(e) {
             openStreetView(geoExtMap.map.getLonLatFromViewPortPx(e.xy));
         }
     });


    function openStreetView (location) {

        //TODO have to check if google is avaliable

        var panel = Ext.getCmp('RightPanel');
        panel.removeAll();

        var x = location.lon;
        var y = location.lat;

        //alert(location);

        var locWgs = location.transform(
            authid,
            new OpenLayers.Projection("EPSG:4326"));

        //add location to higlightlayer
        var marker = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(x,y),
            {},
            streetViewMarkerStyle
        );
        featureInfoHighlightLayer.removeAllFeatures();
        streetViewMarkerStyle.rotation = 0;
        featureInfoHighlightLayer.addFeatures(marker);

        // Configure panorama and associate methods and parameters to it
        var options = {
            position: new google.maps.LatLng(locWgs.lat, locWgs.lon),
            pov: {
                heading: 0,
                pitch: 0,
                zoom: 1
            }
        };

        //panorama = new gxp.GoogleStreetViewPanel({
        //    location: location
        //})

        panorama = new google.maps.StreetViewPanorama(
            panel.body.dom, options
        );

        panel.add(panorama);
        panel.expand();

        //alert(sw.getStatus());


        google.maps.event.addListener(panorama, 'position_changed', function() {
            newLoc = panorama.getPosition();
            x2 = new OpenLayers.LonLat(newLoc.lng(),newLoc.lat());
            x2.transform(
                new OpenLayers.Projection("EPSG:4326"),
                new OpenLayers.Projection(authid)
            );
            marker.move(x2);
        });

        google.maps.event.addListener(panorama, 'pov_changed', function() {
            //panorama.getPov().heading;
            //panorama.getPov().pitch;

            streetViewMarkerStyle.rotation = panorama.getPov().heading;
            featureInfoHighlightLayer.removeAllFeatures();
            featureInfoHighlightLayer.addFeatures(marker);

        });


    }


     geoExtMap.map.addControl(StreetViewControl);


 }

// called when DOM is ready (Ext.onReady in WebgisInit.js)
function customPostLoading() {
//    Ext.get("panel_header").addClass('sogis-header').insertHtml('beforeEnd', '<div style="float: right; width: 250px;">hello world</div>');
}

// called when starting print
function customBeforePrint() {
    // do something. e.g. rearrange your layers
}

// new buttons for the toolbar
var customButtons = [ 
   
//    // Add a separator and a button
//    {
//      xtype: 'tbseparator'
//    }, {
//      xtype: 'button',
//      enableToggle: true,
//      allowDepress: true,
//      toggleGroup: 'mapTools',
//      scale: 'medium',
//      icon: 'gis_icons/test.gif',
//      tooltipType: 'qtip',
//      tooltip: "Test button - click on the map",
//      id: 'TESTBUTTON'
//    }
];

// code to add buttons in the toolbar
function customToolbarLoad() {
//     // Handle the button click
//     Ext.getCmp('TESTBUTTON').toggleHandler = mapToolbarHandler;
}

// called when an event on toolbar is invoked
function customMapToolbarHandler(btn, evt) {
//     // Check if the button is pressed or unpressed
//     if (btn.id == "TESTBUTTON") {
//         if (btn.pressed) {
//              alert ( "You clicked on Test Button!" );
//              openlayersClickEvent.activate();
//         }
//         else
//         {
//              alert ( "TEST button is toggled up!" );
//              openlayersClickEvent.deactivate();
//         }
//     }
}

// called when the user clicks on a check in layerTree.
// n is a Ext.TreeNode object
function customActionLayerTreeCheck(n) {
//    if (n.text == "test layer") {
//        alert ("test layer check state:" + n.attributes.checked);
//    }
}


// called when the user zooms.
function customActionOnZoomEvent() {
	// NOTE: if you define customActionOnMoveEvent() (see below)
	// that function is called during zooms, too!

	// ... action to do on call
}

// called after a drag, pan, or zoom completed
function customActionOnMoveEvent() {
	// ... action to do on call
}
