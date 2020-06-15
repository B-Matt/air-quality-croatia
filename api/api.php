<?php
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

$data_dates = [];
$quality_ranges["pm25"] = [
    [0, 1],
    [10, 20],
    [20, 25],
    [25, 50],
    [50, 75],
    [75, 800]
];
$quality_ranges["pm10"] = [
    [0, 20],
    [20, 40],
    [40, 50],
    [50, 100],
    [100, 150],
    [150, 1200]
];
$quality_ranges["no2"] = [
    [0, 40],
    [40, 90],
    [90, 120],
    [120, 230],
    [230, 340],
    [340, 1000]
];
$quality_ranges["o3"] = [
    [0, 50],
    [50, 100],
    [100, 130],
    [130, 240],
    [240, 380],
    [380, 800]
];
$quality_ranges["so2"] = [
    [0, 100],
    [100, 200],
    [200, 350],
    [350, 500],
    [500, 750],
    [750, 1250]
];

/**
 * Loads data from HAZO's API.
 */

function load_data($id, $polutant)
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    curl_setopt($ch, CURLOPT_URL, 'http://iszz.azo.hr/iskzl/rs/podatak/export/json?postaja=' . $id . '&tipPodatka=4&polutant=' . $polutant . '&vrijemeOd=' . $_GET['from'] . '&vrijemeDo=' . $_GET['to']);
    $result = curl_exec($ch);
    curl_close($ch);

    $load_data = json_decode($result);
    $data = [];
    $response = [];
    
    global $data_dates;
    if(!empty($load_data))
    {
        $data_dates = [];
    }

    for($i = 0; $i < count($load_data); $i++)
    {
        $element = $load_data[$i];
        $timestamp = $element->vrijeme / 1000;
        $data[date('m.Y', $timestamp)][] = $element->vrijednost;
    }
    
    $keys = array_keys($data);
    for($i = 0; $i < count($data); $i++)
    {
        $response[] = array_sum($data[$keys[$i]]) / count($data[$keys[$i]]);
        $data_dates[] = $keys[$i];
    }
    return !empty($response) ? $response : null;
}

/**
 * Checks given values and check it with index range grouped by pollutant.
 */
function check_index($pollutant, $value) {

    global $quality_ranges;
    for($i = 0; $i < count($quality_ranges[$pollutant]); $i++)
    {
        $range = $quality_ranges[$pollutant][$i];
        if($value > $range[0] && $value < $range[1])
        {
            return $i;
        }
    }
    return -1;
}

/**
 * Finds maximum index in given array.
 */
function find_max_index($arr) 
{
    $max = $arr[0];        
    for ($i = 1, $len = count($arr); $i < $len; $i++) {

        $max = ($arr[$i] > $max) ? $arr[$i] : $max;
    }        
    return $max;
}

/**
 * Process gathered data from API.
 */
function process_data($data)
{
    $indexes = [];
    foreach($data as $key => $value)
    {        
        $size = is_null($value) ? 0 : count($value);
        for($i = 0; $i < $size; $i++)
        {
            $indexes[$key][] = check_index($key, $value[$i]);
        }
    }

    $overall_index = [];
    for($i = 0; $i < 13; $i++)
    {
        $index_data = [];
        $index_data[] = isset($indexes["pm25"][$i]) ? $indexes["pm25"][$i] : -1;
        $index_data[] = isset($indexes["pm10"][$i]) ? $indexes["pm10"][$i] : -1;
        $index_data[] = isset($indexes["no2"][$i]) ? $indexes["no2"][$i] : -1;
        $index_data[] = isset($indexes["o3"][$i]) ? $indexes["o3"][$i] : -1;
        $index_data[] = isset($indexes["so2"][$i]) ? $indexes["so2"][$i] : -1;
        $overall_index[] = find_max_index($index_data);
    }
    return $overall_index;
}

/**
 * Main program
 */
$stations = json_decode(file_get_contents('../station_data.json'));

for($i = 0; $i < count($stations); $i++)
{
    $station_id = $stations[$i]->id;
    $tmp_data["pm25"] = load_data($station_id, 28);
    $tmp_data["pm10"] = load_data($station_id, 5);
    $tmp_data["no2"] = load_data($station_id, 1);
    $tmp_data["o3"] = load_data($station_id, 31);
    $tmp_data["so2"] = load_data($station_id, 2);
    $response[$station_id]["indexes"] = process_data($tmp_data);
}

$response["dates"] = $data_dates;

http_response_code(200);
echo json_encode($response);