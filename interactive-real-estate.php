<?php
/*
Plugin Name: interactive real estate
Description: This is interactive real estate plugin
Version: 1.0
Author: Esaia
*/


if (!defined('ABSPATH')) {
    exit;
}

define('IRE_PLUGIN_FILE', __FILE__);
define('IRE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('PLUGIN_URL', admin_url('admin.php?page=ire'));

require_once  plugin_dir_path(IRE_PLUGIN_FILE) . './utils/helpers.php';
require_once  plugin_dir_path(IRE_PLUGIN_FILE) . './utils/init.php';
require_once  plugin_dir_path(IRE_PLUGIN_FILE) . './utils/ajax.php';



add_action('admin_menu', 'ire_add_admin_menu');

function ire_add_admin_menu()
{
    add_menu_page(
        'interactive real estate',      // Page title
        'interactive real estate',      // Menu title
        'manage_options',               // Capability
        'ire',                          // Menu slug
        'ire_render_page',              // Function to display the page
        'dashicons-admin-generic',      // Icon
        100                             // Position
    );
}


function ire_render_page()
{

    if (isset($_GET['project'])) {
        include_once plugin_dir_path(IRE_PLUGIN_FILE) . './templates/projects/single-project.php';
    } else {
        include_once plugin_dir_path(IRE_PLUGIN_FILE) . './templates/index.php';
    }
}
