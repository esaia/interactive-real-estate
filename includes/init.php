<?php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}



// Hook the 'ire_add_admin_menu' function to the 'admin_menu' action.
add_action('admin_menu', 'ire_add_admin_menu');

/**
 * Adds a custom menu item to the WordPress admin dashboard.
 *
 * This function creates a top-level menu for the plugin in the admin sidebar.
 */
function ire_add_admin_menu()
{
    // Add a top-level menu page for the plugin
    add_menu_page(
        'interactive real estate', // The title of the page
        'Interactive Real Estate', // The text displayed in the menu
        'manage_options',          // The capability required for access (only users with 'manage_options' can see it)
        'ire',                     // The unique slug for the menu page
        'ire_render_page',         // The callback function that renders the page content
        'dashicons-building',      // The icon for the menu item (a building icon)
        100                        // The position of the menu item in the admin menu (higher numbers push it lower)
    );
}

/**
 * Renders the content for the plugin's admin page.
 *
 * This function is called when the user clicks on the 'building svg' menu item in the admin sidebar.
 */
function ire_render_page()
{
    // Include the template file that will generate the admin page content
    include_once plugin_dir_path(IREP_PLUGIN_FILE) . './templates/index.php';
}


/**
 * Enqueue Vue.js and related assets (JavaScript and CSS) for the plugin.
 * 
 * This function is used both for the admin area and the frontend.
 * It checks if the scripts/styles are already loaded before enqueuing them again.
 */
function ire_enqueue_vue_assets()
{
    // Only enqueue once if not already enqueued
    if (wp_script_is('ire-vue-js', 'enqueued')) {
        return; // If Vue.js script is already enqueued, do nothing
    }

    // Enqueue WordPress media manager scripts (used for media handling in the plugin)
    wp_enqueue_media();

    // Enqueue Vue.js JavaScript and CSS for the plugin
    wp_enqueue_script('ire-vue-js', plugin_dir_url(IREP_PLUGIN_FILE) . 'dist/assets/index.js', [], null, true);
    wp_enqueue_style('ire-vue-styles', plugin_dir_url(IREP_PLUGIN_FILE) . 'dist/assets/index.css');

    // Localize the script with necessary PHP variables (nonce, AJAX URL, etc.)
    wp_localize_script('ire-vue-js', 'irePlugin', array(
        'nonce' => wp_create_nonce('ire_nonce'),
        'ajax_url' => admin_url('admin-ajax.php'),
        'plugin_url' => IREP_PLUGIN_URL,
        'plugin_assets_path' => plugins_url('assets/', IREP_PLUGIN_FILE)
    ));
}

/**
 * Enqueue Vue.js assets only in the WordPress admin area.
 *
 * @param string $hook The current admin page hook.
 */
function ire_enqueue_admin_scripts($hook)
{
    // Only enqueue scripts/styles on the plugin's admin page
    if ($hook !== 'toplevel_page_ire') {
        return;
    }

    // Enqueue Vue.js assets (JavaScript, CSS) for admin page
    ire_enqueue_vue_assets();
}

add_action('admin_enqueue_scripts', 'ire_enqueue_admin_scripts');

/**
 * Enqueue Vue.js assets only on the front-end of the site.
 */
function ire_enqueue_frontend_scripts()
{
    // Enqueue Vue.js assets (JavaScript, CSS) for frontend
    ire_enqueue_vue_assets();
}

add_action('wp_enqueue_scripts', 'ire_enqueue_frontend_scripts');



/**
 * Add the 'type="module"' and 'defer' attributes to the Vue.js script tag.
 *
 * @param string $tag The HTML script tag.
 * @param string $handle The handle of the script being enqueued.
 *
 * @return string Modified script tag with 'module' type and 'defer' attribute.
 */
function ire_add_module_type_attribute($tag, $handle)
{
    // Check if the script handle matches 'ire-vue-js'
    if ($handle !== 'ire-vue-js') {
        return $tag; // If not, return the original tag
    }

    // Modify the script tag to include 'type="module"' and 'defer' attributes
    return str_replace('src', 'type="module" defer="defer" src', $tag);
}

add_filter('script_loader_tag', 'ire_add_module_type_attribute', 10, 2);



/**
 * Remove the footer text in the WordPress admin dashboard.
 *
 * @return string Empty string to remove the footer text.
 */
function remove_admin_footer_text()
{
    return ''; // Return an empty string to remove the footer text
}

add_filter('admin_footer_text', 'remove_admin_footer_text');


/**
 * Remove the WordPress version information from the footer.
 *
 * @return string Empty string to remove the version info.
 */
function remove_version_info()
{
    return ''; // Return an empty string to remove the version info
}

add_filter('update_footer', 'remove_version_info', 11);
