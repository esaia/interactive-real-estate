<?php
/*
Plugin Name: Interactive Real Estate
Version: 1.0.0
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



// Function to output the widget content
function my_plugin_dashboard_widget_content()
{
    echo "<p><strong>Plugin Name:</strong> My Awesome Plugin</p>";
    echo "<p><strong>Version:</strong> 1.0.0</p>";

    // Premium features
    echo "<p><strong>Premium Features:</strong></p>";
    echo "<ul>
            <li>Advanced analytics</li>
            <li>Priority support</li>
            <li>Custom templates</li>
            <li>No ads or branding</li>
          </ul>";

    // CTA
    echo "<p>Unlock the full potential of the plugin with the premium version!</p>";
    echo "<a href='https://example.com/go-premium' target='_blank' style='background: #0073aa; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 5px;'>Upgrade to Premium</a>";

    // Social proof
    echo "<p><strong>What users are saying:</strong></p>";
    echo "<blockquote>\"This plugin saved me hours of work. The premium version is worth every penny!\"</blockquote>";

    // Documentation
    echo "<p><strong>Need help?</strong></p>";
    echo "<ul>
            <li><a href='https://example.com/docs' target='_blank'>Documentation</a></li>
            <li><a href='https://example.com/support' target='_blank'>Support Forum</a></li>
          </ul>";
}

// Function to add the widget to the dashboard
function my_plugin_add_dashboard_widget()
{
    wp_add_dashboard_widget(
        'interactive real estate', // Widget ID
        'interactive real estate',      // Widget title
        'my_plugin_dashboard_widget_content' // Callback function to output content
    );
}

// Hook the function to the dashboard setup
add_action('wp_dashboard_setup', 'my_plugin_add_dashboard_widget');
