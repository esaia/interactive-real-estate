<?php
/*
Plugin Name: Interactive Real Estate
Description: The most innovative WordPress plugin for creating interactive buildings.
Version: 1.0
Author: Interactive Real Estate
Plugin URI: https://google.com/
*/


if (!defined('ABSPATH')) {
    exit;
}

define('IRE_PLUGIN_FILE', __FILE__);
define('IRE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('PLUGIN_URL', admin_url('admin.php?page=ire'));


require_once  plugin_dir_path(IRE_PLUGIN_FILE) . './utils/init.php';
require_once  plugin_dir_path(IRE_PLUGIN_FILE) . './utils/migrations.php';
require_once  plugin_dir_path(IRE_PLUGIN_FILE) . './utils/ajax.php';


add_action('admin_menu', 'ire_add_admin_menu');

function ire_add_admin_menu()
{
    add_menu_page(
        'interactive real estate',
        'interactive real estate',
        'manage_options',
        'ire',
        'ire_render_page',
        'dashicons-building',
        100
    );
}


function ire_render_page()
{


    include_once plugin_dir_path(IRE_PLUGIN_FILE) . './templates/index.php';
}


add_filter('admin_footer_text', 'remove_admin_footer_text');
add_filter('update_footer', 'remove_version_info', 11);

function remove_admin_footer_text()
{
    return '';
}

function remove_version_info()
{
    return '';
}
