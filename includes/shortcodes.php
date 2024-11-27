<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Render the shortcode to display a Vue component with dynamic project ID.
 *
 * @param array $atts Shortcode attributes, including the project ID.
 *
 * @return string The HTML markup for the Vue component.
 */
function ire_render_vue_preview_shortcode($atts)
{
    // Set default attribute values for the shortcode
    $atts = shortcode_atts(array(
        'id' => 0, // Default to 0 if no ID is provided
    ), $atts, 'vue_preview');

    // Get and sanitize the project ID
    $project_id = intval($atts['id']);
    // Generate a unique ID for the div container to prevent conflicts
    $unique_id = 'ire-shortcode-' . uniqid();

    ob_start(); // Start output buffering
?>
    <div id="<?php echo esc_attr($unique_id); ?>" data-project-id="<?php echo esc_attr($project_id); ?>">
    </div>
<?php
    return ob_get_clean(); // Return the generated HTML content
}

add_shortcode('ire_project', 'ire_render_vue_preview_shortcode');
