<?php
require_once('./request.php');
require_once('./cache.php');

ini_set("precision", 14); 
ini_set("serialize_precision", -1);

if(!isset($_GET['from']) || !isset($_GET['to'])) 
{
    $response['error'] = true;
    $response['message'] = "Missing parameters!";
    http_response_code(400);
    die(json_encode($response, JSON_UNESCAPED_UNICODE));
    die();
}

$cache = new Cache();
if($cache->is_cache())
{
    http_response_code(200);
    echo $cache->get_cache();
    die();
}

$request = new Request();
$stations = json_decode(file_get_contents('../station_data.json'));

for($i = 0; $i < count($stations); $i++)
{
    $station_id = $stations[$i]->id;

    $urls = [];
    $urls[] = 'http://iszz.azo.hr/iskzl/rs/podatak/export/json?postaja=' . $station_id . '&tipPodatka=4&polutant=28&vrijemeOd=' . $_GET['from'] . '&vrijemeDo=' . $_GET['to'];
    $urls[] = 'http://iszz.azo.hr/iskzl/rs/podatak/export/json?postaja=' . $station_id . '&tipPodatka=4&polutant=5&vrijemeOd=' . $_GET['from'] . '&vrijemeDo=' . $_GET['to'];
    $urls[] = 'http://iszz.azo.hr/iskzl/rs/podatak/export/json?postaja=' . $station_id . '&tipPodatka=4&polutant=1&vrijemeOd=' . $_GET['from'] . '&vrijemeDo=' . $_GET['to'];
    $urls[] = 'http://iszz.azo.hr/iskzl/rs/podatak/export/json?postaja=' . $station_id . '&tipPodatka=4&polutant=31&vrijemeOd=' . $_GET['from'] . '&vrijemeDo=' . $_GET['to'];
    $urls[] = 'http://iszz.azo.hr/iskzl/rs/podatak/export/json?postaja=' . $station_id . '&tipPodatka=4&polutant=2&vrijemeOd=' . $_GET['from'] . '&vrijemeDo=' . $_GET['to'];
    
    $data = $request->load_data($urls, ['pm25', 'pm10', 'no2', 'o3', 'so2']);

    $response[$station_id]['indexes']['all'] = $request->get_overall_index($data);
    $response[$station_id]['indexes']['pm25'] = $request->get_pollutant_index($data, 'pm25');
    $response[$station_id]['indexes']['pm10'] = $request->get_pollutant_index($data, 'pm10'); 
    $response[$station_id]['indexes']['no2'] = $request->get_pollutant_index($data, 'no2');
    $response[$station_id]['indexes']['o3'] = $request->get_pollutant_index($data, 'o3');
    $response[$station_id]['indexes']['so2'] = $request->get_pollutant_index($data, 'so2');
    $response[$station_id]['rest_data'] = $data;
}
$response["dates"] = $request->get_dates();
$response = json_encode($response);

http_response_code(200);
echo $response;
$cache->write_cache($response);