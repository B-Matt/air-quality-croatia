<?php

class Cache {

    public $cache;
    public $force_refresh;
    public $refresh;

    function __construct()
    {
        $this->cache = __DIR__ . DIRECTORY_SEPARATOR . "aq_index_cache.json";
        $this->force_refresh = false;
        $this->refresh = 60 * 60;
    }

    function is_cache()
    {
        if($this->force_refresh || filesize($this->cache) == 0 || ((time() - filectime($this->cache)) > $this->refresh)) 
        {
            return 0;
        }
        return 1;
    }

    function get_cache()
    {
        return file_get_contents($this->cache);
    }

    function write_cache($data)
    {
        if(filesize($this->cache) != 0) 
        {
            unlink($this->cache);
        }

        $handle = fopen($this->cache, 'wb');
        fwrite($handle, $data);
        fclose($handle);
    }
}