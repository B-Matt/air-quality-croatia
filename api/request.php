<?php 
error_reporting(E_ALL);

class Request 
{
    public $data_dates;
    public $quality_ranges;

    public function __construct() 
    {
        $this->data_dates = [];
        $this->quality_ranges["pm25"] = [
            [0, 1],
            [10, 20],
            [20, 25],
            [25, 50],
            [50, 75],
            [75, 800]
        ];
        $this->quality_ranges["pm10"] = [
            [0, 20],
            [20, 40],
            [40, 50],
            [50, 100],
            [100, 150],
            [150, 1200]
        ];
        $this->quality_ranges["no2"] = [
            [0, 40],
            [40, 90],
            [90, 120],
            [120, 230],
            [230, 340],
            [340, 1000]
        ];
        $this->quality_ranges["o3"] = [
            [0, 50],
            [50, 100],
            [100, 130],
            [130, 240],
            [240, 380],
            [380, 800]
        ];
        $this->quality_ranges["so2"] = [
            [0, 100],
            [100, 200],
            [200, 350],
            [350, 500],
            [500, 750],
            [750, 1250]
        ];
    }

    /**
     * Loads data from HAZO's API.
     */
    public function load_data($url_array, $keys_array)
    {
        $count = count($url_array);
        $curl_arr = [];
        $master = curl_multi_init();

        for($i = 0; $i < $count; $i++)
        {
            $url = $url_array[$i];
            $curl_arr[$i] = curl_init($url);
            curl_setopt($curl_arr[$i], CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl_arr[$i], CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
            curl_multi_add_handle($master, $curl_arr[$i]);
        }

        do 
        {
            curl_multi_exec($master,$running);
        } 
        while($running > 0);

        $results = [];
        for($i = 0; $i < $count; $i++)
        {
            $load_data = json_decode(curl_multi_getcontent($curl_arr[$i]));
            $data = [];

            if(!empty($load_data))
            {
                $this->data_dates = [];
            }

            for($j = 0; $j < count($load_data); $j++)
            {
                $element = $load_data[$j];
                $timestamp = $element->vrijeme / 1000;
                $data[date('m.Y', $timestamp)][] = $element->vrijednost;
            }

            $keys = array_keys($data);
            for($k = 0; $k < count($data); $k++)
            {
                $results[$keys_array[$i]][] = array_sum($data[$keys[$k]]) / count($data[$keys[$k]]);
                $this->data_dates[] = $keys[$k];
            }
        }
        return $results;
    }

    /**
     * Process gathered data from API.
     */
    public function process_data($data)
    {
        $indexes = [];
        foreach($data as $key => $value)
        {        
            $size = is_null($value) ? 0 : count($value);
            for($i = 0; $i < $size; $i++)
            {
                $indexes[$key][] = $this->check_index($key, $value[$i]);
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
            $overall_index[] = $this->find_max_index($index_data);
        }
        return $overall_index;
    }

    /**
     * Returns data dates.
     */
    public function get_dates()
    {
        return $this->data_dates;
    }

    /**
     * Checks given values and check it with index range grouped by pollutant.
     */
    function check_index($pollutant, $value) 
    {
        for($i = 0; $i < count($this->quality_ranges[$pollutant]); $i++)
        {
            $range = $this->quality_ranges[$pollutant][$i];
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
}