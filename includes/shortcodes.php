<?php

if (!defined('ABSPATH')) {
    exit;
}



/**
 * Enqueue Vue.js assets only on the front-end of the site.
 */
function irep_enqueue_frontend_scripts()
{

    wp_enqueue_style(
        'irep-shortcode-style',
        plugin_dir_url(IREP_PLUGIN_FILE) . 'dist-shortcode/assets/index.css',
        [],
        '1.0.0'
    );

    wp_enqueue_script('irep-shortcode',  plugin_dir_url(IREP_PLUGIN_FILE) . 'dist-shortcode/assets/index.js', null, true);

    $translations = irep_get_translations();

    wp_localize_script('irep-shortcode', 'irePluginWp', array(
        'nonce' => wp_create_nonce('irep_nonce'),
        'ajax_url' => admin_url('admin-ajax.php'),
        'translations' =>  $translations
    ));
}

add_action('wp_enqueue_scripts', 'irep_enqueue_frontend_scripts', 20);




/**
 * Render the shortcode to display a Vue component with dynamic project ID.
 *
 * @param array $atts Shortcode attributes, including the project ID.
 *
 * @return string The HTML markup for the Vue component.
 */
function irep_render_vue_preview_shortcode($atts)
{



    // Set default attribute values for the shortcode
    $atts = shortcode_atts(array(
        'id' => 0, // Default to 0 if no ID is provided
    ), $atts, 'vue_preview');

    // Get and sanitize the project ID
    $project_id = intval($atts['id']);
    // Generate a unique ID for the div container to prevent conflicts
    $unique_id = 'irep-shortcode-' . uniqid();

    ob_start(); // Start output buffering
?>
    <div id="<?php echo esc_attr($unique_id); ?>" data-project-id="<?php echo esc_attr($project_id); ?>">
    </div>
    <div id="my-aapp"></div>
<?php
    return ob_get_clean(); // Return the generated HTML content
}

add_shortcode('irep_project', 'irep_render_vue_preview_shortcode');
