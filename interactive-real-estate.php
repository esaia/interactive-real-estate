<?php
/*
Plugin Name: Interactive Real Estate
Version: 1.1
Description: Very innovative WordPress plugin for creating interactive buildings. Quickly make your property images interactive with adding pins, creating polygon.
Plugin URI: https://interactive-real-estate.vercel.app/
Author: <a href="https://portfolioesaia.netlify.app/" target="_blank">Esaia Gaprindashvili</a>
License: GPL2
License URI: http://www.gnu.org/licenses/gpl-2.0.html
*/


if (!defined('ABSPATH')) {
    exit;
}

define('IREP_PLUGIN_FILE', __FILE__);
define('IREP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('IREP_PLUGIN_URL', admin_url('admin.php?page=ire'));


require_once  plugin_dir_path(IREP_PLUGIN_FILE) . './includes/helper.php';
require_once  plugin_dir_path(IREP_PLUGIN_FILE) . './includes/init.php';
require_once  plugin_dir_path(IREP_PLUGIN_FILE) . './includes/migrations.php';
require_once  plugin_dir_path(IREP_PLUGIN_FILE) . './includes/api.php';
require_once  plugin_dir_path(IREP_PLUGIN_FILE) . './includes/shortcodes.php';
