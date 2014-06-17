/**
 * Created by Uros on 15.6.2014.
 */

// *******************
// CONTEXT MENU STUFF
// Function to zoom to layer extent - called by context menu on left panel (only on the leafs
// of tree node)
function zoomToLayerExtent(item) {
    var myLayerName = layerTree.getSelectionModel().getSelectedNode().text;

    myArray = wmsLoader.projectSettings.capability.layers;
    var arrayLength = myArray.length;
    // Search through the layers of the project file
    for (var i = 0; i < arrayLength; i++) {
        l = myArray[i];
        if (l.name == myLayerName) {
            // NOTE: I'm using the default projection of the project.
            // Maybe it would be a problem with different projections?
            bbox = l.bbox[geoExtMap.map.projection.toString()].bbox;
            geoExtMap.map.zoomToExtent(new OpenLayers.Bounds(bbox));
            break;
        }
    }
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
        id: 'layerData',
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

function setupEditFormWindow() {
    editFormWindow = new Ext.Window({
        title: 'aaaaaaaaaaaaaaaa',
        width: geoExtMap.getWidth() * 0.5,
        height: geoExtMap.getHeight() * 0.5,
        id: 'editForm',
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
    //editForm = Ext.getCmp('editForm');
}

function StartEditing() {

    //initialize Ext Window if undefined
    if (editFormWindow == undefined) {
        setupEditFormWindow();
    }

    var editor = new QGIS.Editor({
        renderTo:   'editForm'

    });

    //editForm.add(editor);

    //legendMetadataWindow.setTitle(legendMetadataWindowTitleString[lang] + ' "'+layertitle+'"');
    if (editFormWindow_active == false) {
        editFormWindow.show();
    }





//    var editWindow = new Ext.FormPanel({
//        labelWidth: 75, // label settings here cascade unless overridden
//        url:'save-form.php',
//        frame:true,
//        title: 'Simple Form',
//        bodyStyle:'padding:5px 5px 0',
//        width: 200,
//        defaults: {width: 100},
//        defaultType: 'textfield',
//
//        items: [{
//            fieldLabel: 'First Name',
//            name: 'first',
//            allowBlank:false
//        },{
//            fieldLabel: 'Last Name',
//            name: 'last'
//        },{
//            fieldLabel: 'Company',
//            name: 'company'
//        }, {
//            fieldLabel: 'Email',
//            name: 'email',
//            vtype:'email'
//        }, new Ext.form.TimeField({
//            fieldLabel: 'Time',
//            name: 'time',
//            minValue: '8:00am',
//            maxValue: '6:00pm'
//        })
//        ],
//
//        buttons: [{
//            text: 'Save'
//        },{
//            text: 'Cancel'
//        }]
//    });






    //targetComponent.add(simple);


    //targetComponent = Ext.getCmp('RightPanel');
    //targetComponent.show();
    //targetComponent.collapsible && targetComponent.expand();

    //editor.buildForm();
    //editor.buildUI();
    //targetComponent.doLayout();


}