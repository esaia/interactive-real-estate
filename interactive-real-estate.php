<?php
/*
Plugin Name: Interactive Real Estate
Version: 1.0.3
Description: Innovative WordPress plugin for creating interactive buildings. Quickly make your property images interactive with adding pins, creating polygon.
Plugin URI: https://interactive-real-estate.vercel.app/
Author: <a href="https://portfolioesaia.netlify.app/" target="_blank">Esaia Gaprindashvili</a>
License: GPL2
License URI: http://www.gnu.org/licenses/gpl-2.0.html
*/


if (!defined('ABSPATH')) {
    exit;
}


if (! function_exists('ire_fs')) {
    // Create a helper function for easy SDK access.
    function ire_fs()
    {
        global $ire_fs;

        if (! isset($ire_fs)) {
            // Include Freemius SDK.
            require_once dirname(__FILE__) . '/freemius/start.php';

            $ire_fs = fs_dynamic_init(array(
                'id'                  => '17710',
                'slug'                => 'interactive-real-estate',
                'premium_slug'        => 'interactive-real-estate-premium',
                'type'                => 'plugin',
                'public_key'          => 'pk_28cee94284e5b1a7fc7fcde632e02',
                'is_premium'          => true,
                'premium_suffix'      => 'premume',
                // If your plugin is a serviceware, set this option to false.
                'has_premium_version' => true,
                'has_addons'          => false,
                'has_paid_plans'      => true,
                'menu'                => array(
                    'slug'           => 'interactive-real-estate',
                    'support'        => false,
                ),
            ));
        }

        return $ire_fs;
    }

    // Init Freemius.
    ire_fs();
    // Signal that SDK was initiated.
    do_action('ire_fs_loaded');
}



define('IREP_PLUGIN_FILE', __FILE__);
define('IREP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('IREP_PLUGIN_URL', admin_url('admin.php?page=interactive-real-estate'));


require_once  plugin_dir_path(IREP_PLUGIN_FILE) . './includes/helper.php';
require_once  plugin_dir_path(IREP_PLUGIN_FILE) . './includes/init.php';
require_once  plugin_dir_path(IREP_PLUGIN_FILE) . './includes/migrations.php';
require_once  plugin_dir_path(IREP_PLUGIN_FILE) . './includes/api.php';
require_once  plugin_dir_path(IREP_PLUGIN_FILE) . './includes/shortcodes.php';
