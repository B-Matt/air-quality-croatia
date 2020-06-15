<?php
ini_set("precision", 14); 
ini_set("serialize_precision", -1);

if(!isset($_GET['id']) || !isset($_GET['from']) || !isset($_GET['to'])) 
{
    $response['error'] = true;
    $response['message'] = "Missing parameters!";
    http_response_code(400);
    die(json_encode($response, JSON_UNESCAPED_UNICODE));
    die();
}

function load_data($polutant)
{
    $load_data = json_decode(file_get_contents('http://iszz.azo.hr/iskzl/rs/podatak/export/json?postaja=' . $_GET['id'] . '&tipPodatka=4&polutant=' . $polutant . '&vrijemeOd=' . $_GET['from'] . '&vrijemeDo=' . $_GET['to']));
    $data = [];
    $response = [];

    foreach($load_data as $element) 
    {
        $timestamp = $element->vrijeme / 1000;
        $datetime = DateTime::createFromFormat('U', $timestamp);
        $data[$datetime->format('m.Y')][] = $element->vrijednost;
    }
    
    foreach($data as $key => $value)
    {
        $response[$key][] = round(array_sum($value) / count($value), 3);
    }
    return !empty($response) ? array($response) : null;
}

$response["pm25"] = load_data(28);
$response["pm10"] = load_data(5);
$response["no2"] = load_data(1);
$response["o3"] = load_data(31);
$response["so2"] = load_data(2);

http_response_code(200);
echo json_encode($response, JSON_PRETTY_PRINT);