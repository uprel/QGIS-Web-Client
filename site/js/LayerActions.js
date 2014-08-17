// *******************
// CONTEXT MENU STUFF
// Function to zoom to layer extent - called by context menu on left panel (only on the leafs
// of tree node)
function zoomToLayerExtent(item) {
    var bbox = null;
    var myLayerName = layerTree.getSelectionModel().getSelectedNode().text;
    bbox = new OpenLayers.Bounds(wmsLoader.layerProperties[myLayerName].bbox).transform('EPSG:4326', geoExtMap.map.projection);
    geoExtMap.map.zoomToExtent(bbox);
}

function exportHandler(item) {
    var myLayerName = layerTree.getSelectionModel().getSelectedNode().text;
    var myFormat = item.container.menuItemId;

    switch(myFormat) {
        case 'SHP':
            exportData(myLayerName,myFormat);
            break;
        case 'DXF':
            exportData(myLayerName,myFormat);
            break;
        case 'CSV':
            exportData(myLayerName,myFormat);
            break;
        default :
            Ext.Msg.alert ('Error',myFormat+' not supported yet.');
            break;

    }
}

function onItemCheck(item, checked){
    //here we should preserve context menu not closing
}


// Show the menu on right click of the leaf node of the layerTree object
function contextMenuHandler(node) {
    //disable option for opentable if layer is not queryable
    var queryable = true;
    queryable = wmsLoader.layerProperties[node.attributes.text].queryable;
    var contTable = Ext.getCmp('contextOpenTable');
    if (queryable)
        contTable.setDisabled(false);
    else
        contTable.setDisabled(true);
    node.select();
    menuC.show ( node.ui.getAnchor());
}


function exportData(layer,format) {

    //current view is used as bounding box for exporting data
    var bbox = geoExtMap.map.calculateBounds();
    //Ext.Msg.alert('Info',layer+' ' + bbox);

    var exportUrl = "./client/php/export.php?" + Ext.urlEncode({
        map:projectData.project,
        SRS:authid,
        map0_extent:bbox,
        layer:layer,
        format:format
    });

    var body = Ext.getBody();
    var frame = body.createChild({
        tag	:'iframe',
        cls	:'x-hidden',
        id		:'hiddenform-iframe',
        name	:'iframe',
        src	:exportUrl
    });

    //TODO Uros: treba je narediti dvofazno, korak 1 generira export in pošlje json result status in message(url), 2. korak pa na osnovi statusa izvede download ali obvesti o napaki
    // frame.on('load',
    // function(e, t, o){
    // alert(o.test);
    // }
    // , null, {test:'hello'});
}

function openAttTable() {
    var myLayerName = layerTree.getSelectionModel().getSelectedNode().text;


    var layer = new QGIS.SearchPanel({
        useWmsRequest: true,
        queryLayer: myLayerName,
        gridColumns: getLayerAttributes(myLayerName),
        gridLocation: 'bottom',
        gridTitle: myLayerName,
        gridResults: 2000,
        gridResultsPageSize: 20,
        selectionLayer: myLayerName,
        formItems: [],
        doZoomToExtent: true

    });

    //Ext.getCmp('BottomPanel').setTitle(layer.gridTitle,'x-cols-icon');
    //Ext.get('BottomPanel').setStyle('padding-top', '2px');

    layer.onSubmit();

    layer.on("featureselected", showFeatureSelected);
    layer.on("featureselectioncleared", clearFeatureSelected);
    layer.on("beforesearchdataloaded", showSearchPanelResults);

}



/**
 *
 * @param layer
 * @returns {{}}
 */
function getLayerAttributes(layer) {

    var ret = [];

    for (var i=0;i<wmsLoader.layerProperties[layer].attributes.length;i++) {
        ret[i] = {};
        attribute = wmsLoader.layerProperties[layer].attributes[i];
        ret[i].header = attribute.name;
        ret[i].dataIndex = attribute.name;
        ret[i].menuDisabled = false;
        ret[i].sortable = true;
        ret[i].filterable = true;
        if(attribute.type=='double') {
            ret[i].xtype = 'numbercolumn';
            ret[i].format = '0.000,00/i';
            ret[i].align = 'right';
            //no effect
            //ret[i].style = 'text-align:left'
        }
        if(attribute.type=='int') {
            ret[i].xtype = 'numbercolumn';
            ret[i].format = '000';
            ret[i].align = 'right';
        }
    }

    ret.unshift(new Ext.ux.grid.RowNumberer({width: 32}));

    return ret;
}

function setupEditFormWindow(title) {
    editFormWindow = new Ext.Window({
        title: title,
        width: geoExtMap.getWidth() * 0.4,
        autoScroll: true,
        maximizable: true,
        layout: 'fit',
        shadow: false,
        listeners: {
            show:function() {
                editFormWindow_active = true;
            },
            hide:function() {
                editFormWindow_active = false;
            },
            close: function() {
                editFormWindow = undefined;
            }
        }
    });
}

function editHandler() {

    var selmod = this.ownerCt.ownerCt.getSelectionModel();
    if (selmod.selections.items.length==0) {
        //TODO TRANSLATE
        Ext.Msg.alert("Napaka","Izberi vrstico!");
    }
    else {
        var selectedLayer = this.ownerCt.ownerCt.title;
        var recId = selmod.getSelected().id;



//        var saveStrategy = new OpenLayers.Strategy.Save();
//        var refreshStrategy = new OpenLayers.Strategy.Refresh();

//        var edit_1 = new OpenLayers.Layer.Vector("Editable Features", {
//            strategies: [refreshStrategy,saveStrategy],
//            projection: new OpenLayers.Projection("EPSG:2170"),
//            protocol: new OpenLayers.Protocol.WFS({
//                version: "1.0.0",
//                srsName: "EPSG:2170",
//                url: wmsURI,
//                featureNS: "http://www.qgis.org/gml",
//                featureType: selectedLayer,
//                geometryName: "geometry"
//                //styleMap: styleMapHighLightLayer
//                //,schema: "http://demo.opengeo.org/geoserver/wfs/DescribeFeatureType?version=1.1.0&typename=og:restricted"
//            })
//        });

        //edit_1.filter(new OpenLayers.Filter.Logical)

        //refreshStrategy.activate();
        //refreshStrategy.refresh();
        //alert(edit_1.getFeatureById(0));
        //geoExtMap.map.addLayers([edit_1]);


        //initialize Ext Window if undefined
        var editFormWindowTitle = TR.editData+ ": " + selectedLayer+" ID"+recId;
        if (editFormWindow == undefined) {
            setupEditFormWindow(editFormWindowTitle);
        }
        else {
            editFormWindow.destroy();
            setupEditFormWindow(editFormWindowTitle);
        }

        var editor = new QGIS.Editor({
            editLayer: selectedLayer
        });

         //getfeature request
        var getFeatureRequest = OpenLayers.Request.GET({
            url: wmsURI,
            params: {
                typeName: editor.editLayer,
                service: "WFS",
                version: "1.0.0",
                request: "GetFeature",
                featureid: editor.editLayer+"."+recId
            },
            success: function(reply) {
                var resultFormat = new OpenLayers.Format.GML();
                var record = resultFormat.read(reply.responseText)[0];
                editor.loadRecord(record);

                //var feature = resultFormat.parseFeature(record);

                //edit_1.removeAllFeatures();
                //edit_1.addFeatures(record);

                //refreshStrategy.refresh();

            },
            failure: function(reply) {
                alert("failed");
            }
        });

        //console.log("GetFeatureRequestReadyState="+getFeatureRequest.readyState);

        editFormWindow.add(editor);
        editFormWindow.doLayout();

        if (editFormWindow_active == false) {
            editFormWindow.show();
        }
    }
}