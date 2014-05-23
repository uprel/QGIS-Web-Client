<?php

/*
 *
 * Sample for exporting from a postgis database to an esri shapefile using gdal ogr2ogr
 * Need to install gdal binaries (apt-get install gdal-bin) and adapt the ogr2ogr command you need.
 * Can be adapted to export/import almost everything (look at http://www.gdal.org/ogr/ogr_formats.html)
 * 
 * Nicolas Liaudat - nliaudat(at)pompiers-chatel(dot)ch
 *
 *
 * export.php -- part of Quantum GIS Web Client
 *
 * Copyright (2014), The QGIS Project All rights reserved.
 * Quantum GIS Web Client is released under a BSD license. Please see
 * https://github.com/qgis/qgis-web-client/blob/master/README
 * for the full text of the license and the list of contributors.
 *
*/ 
//Modifications: Uros Preloznik

require_once('helpers.php');
require_once('../../admin/settings.php');

if(isset($_REQUEST['map0_extent'])){
	$extent =  explode(",", $_REQUEST['map0_extent']);
	$xmin = $extent[0];
	$ymin = $extent[1];
	$xmax = $extent[2];
	$ymax = $extent[3];
	
	if (! (is_numeric($xmin) && is_numeric($ymin) && is_numeric($xmax) && is_numeric($xmin) && is_numeric($ymax))){
		die('SQL injection prevention : bad extent');
	}
	
}else{
die('You must provide a valid bounding box');
}

if(isset($_REQUEST['SRS'])){
	$srid = substr(strrchr($_REQUEST['SRS'],':'),1);
	
	if (! is_numeric($srid)){
		die('SQL injection prevention : bad srid');
	}
	
}

if(isset($_REQUEST['format'])) {
	$format = $_REQUEST['format'];
}
else {
	die('No format');
}

if(isset($_REQUEST['layer'])) {
	$layername = $_REQUEST['layer'];
}
else {
	die('No layer');
}

if(isset($_REQUEST['map'])) {
	$map = $_REQUEST['map'];
}
else {
	die('No map');
}

$now = date("Ymd_His");
$layerAlias = normalize($layername);
$filename = TEMP_PATH . $layerAlias . '_' . $now;
$filename_zip = $layerAlias . '_' . $now . '.zip';
$ctype = "application/zip";
$makeZip = true;
$fsize = -1;

// Get project
$project = get_project(PROJECT_PATH . $map . '.qgs');
// Get layer
$layer = get_layer($layername, $project);
// Check layer provider
if((string)$layer->provider != 'postgres' && (string)$layer->provider != 'spatialite'){
        die('only postgis or spatialite layers are supported: ' . (string)$layer->provider);
}
// Get layer info
$li = get_layer_info($layer, $project);

if ((string)$layer->provider=='postgres') {
	//other option to get it from layer_info
	$conn = str_replace(array('\'', '"'), '', $layer->datasource);
	//removing text sslmode and all after that
	$conn = "PG:" . rtrim(substr($conn,0,strpos($conn,'sslmode')));

	$table = $li['table'];
	$geom = $li['geom_column'];
    $options = "";
	
	if($format=='SHP') {
		$format_name = 'ESRI Shapefile';
	}
	else if ($format=='DXF') {
		$format_name = $format;
	}
    else if ($format=='CSV') {
        $format_name = $format;
        $options = "-lco SEPARATOR=SEMICOLON";
        $makeZip = false;
        $filename_zip = $layerAlias . '_' . $now . '.csv';
        $ctype = "text/csv";
    }
	else {
		die ('Format not supported');
	}

    //setting pgclientencoding
    putenv('PGCLIENTENCODING=windows-1250');

	$mycmd = OGR2OGR . ' -s_srs EPSG:3857 -t_srs EPSG:2170 -f "'.$format_name.'" "'.$filename .'.'.strtolower($format).'" ' . $options . ' "'.$conn.'" -sql "SELECT * FROM '.$table.' WHERE '.$geom.' && ST_MakeEnvelope(' .$xmin .', ' .$ymin .', ' .$xmax .', ' .$ymax .', ' .$srid .')" -progress';

}
else {
	die ('only postgis layers');
}


//echo (var_dump($li));	
//echo ($conn.'</br>');
//echo ($geom.'</br>');
//echo ($table);
//exit();


try {

    $output = shell_exec($mycmd);

    if($makeZip) {

        $zip = new ZipArchive();

        if ($zip->open($filename_zip, ZipArchive::CREATE)!==TRUE) {
            exit("Cannot write <$filename_zip>\n");
        }

        //$zip->addFile("./" .$filename ,$now ."/" .$filename);

        $zip->addFile($filename.'.'.strtolower($format), basename($filename.'.'.strtolower($format)));
        if($format=='SHP') {
            $zip->addFile($filename.'.shx', basename($filename.'.shx'));
            $zip->addFile($filename.'.dbf', basename($filename.'.dbf'));
            $zip->addFile($filename.'.prj', basename($filename.'.prj'));
        }
        $zip->close();

        //$fsize = filesize('./' .$filename_zip);
        $fsize = filesize($filename_zip);
    }
    else {
        //for formats that are not zipped (CSV...)
        $fsize = filesize($filename .'.'.strtolower($format));
    }

}
catch(Exception $e) {
	echo 'Error:' , $e->getMessage();
	exit();
}
	
    header("Pragma: public"); // required
    header("Expires: 0");
    header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
    header("Cache-Control: private",false); // required for certain browsers
    header("Content-Type: " . $ctype);
    header("Content-Disposition: attachment; filename=\"".$filename_zip."\";" );
    header("Content-Transfer-Encoding: binary");
    header("Content-Length: ".$fsize);
    ob_clean();
    flush();

if ($makeZip) {
    readfile($filename_zip);
}
else {
    readfile($filename .'.'.strtolower($format));
}

	//removing shp
	if($format=='SHP') {
		unlink($filename.'.dbf');
		unlink($filename.'.shx');
		unlink($filename.'.prj');
	}
	unlink($filename.'.'.$format);

    if (file_exists($filename_zip)) {
            unlink($filename_zip);
    }

    exit();


  
?>
