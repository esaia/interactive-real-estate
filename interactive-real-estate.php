<?php
/*
Plugin Name: Interactive Real Estate
Description: The most innovative WordPress plugin for creating interactive buildings.
Version: 1.0
Author: Interactive Real Estate
Plugin URI: https://interactive-real-estate.vercel.app/
Text Domain: ire-plugin
Domain Path: /languages
*/


if (!defined('ABSPATH')) {
    exit;
}

define('IRE_PLUGIN_FILE', __FILE__);
define('IRE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('IRE_PLUGIN_URL', admin_url('admin.php?page=ire'));


require_once  plugin_dir_path(IRE_PLUGIN_FILE) . './includes/helper.php';
require_once  plugin_dir_path(IRE_PLUGIN_FILE) . './includes/init.php';
require_once  plugin_dir_path(IRE_PLUGIN_FILE) . './includes/migrations.php';
require_once  plugin_dir_path(IRE_PLUGIN_FILE) . './includes/ajax.php';
require_once  plugin_dir_path(IRE_PLUGIN_FILE) . './includes/shortcodes.php';
