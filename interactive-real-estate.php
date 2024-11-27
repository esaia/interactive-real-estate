<?php
/*
Plugin Name: Interactive Real Estate
Version: 1.0
Description: The most innovative WordPress plugin for creating interactive buildings.
Plugin URI: https://interactive-real-estate.vercel.app/
Author URI: https://interactive-real-estate.vercel.app/
Author: Esaia Gaprindashvili
License: GPL2
License URI: http://www.gnu.org/licenses/gpl-2.0.html
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
require_once  plugin_dir_path(IRE_PLUGIN_FILE) . './includes/api.php';
require_once  plugin_dir_path(IRE_PLUGIN_FILE) . './includes/shortcodes.php';
