<?php


/**
 *  enque js and css scripts
 */
function ire_enqueue_scripts($hook)
{

    if ($hook !== 'toplevel_page_ire') {
        return;
    }


    wp_enqueue_media();


    wp_enqueue_script('vue-js',   plugin_dir_url(IRE_PLUGIN_FILE) . 'dist/assets/index.js', [], null, true);
    wp_enqueue_style('vue-styles',   plugin_dir_url(IRE_PLUGIN_FILE) . 'dist/assets/index.css');


    wp_localize_script('vue-js', 'irePlugin', array(
        'nonce' => wp_create_nonce('ire_nonce'),
        'ajax_url' => admin_url('admin-ajax.php'),
        'plugin_url' => PLUGIN_URL
    ));
}

add_action('admin_enqueue_scripts', 'ire_enqueue_scripts');


function ire_render_vue_preview_shortcode($atts)
{
    $atts = shortcode_atts(array(
        'id' => 0,
    ), $atts, 'vue_preview');

    $project_id = intval($atts['id']);
    $unique_id = 'ire-shortcode-' . uniqid();

    ob_start();
?>
    <div id="<?php echo esc_attr($unique_id); ?>" data-project-id="<?php echo esc_attr($project_id); ?>">
    </div>
<?php
    return ob_get_clean();
}

add_shortcode('ire_project', 'ire_render_vue_preview_shortcode');


function ire_enqueue_vue_scripts()
{
    wp_enqueue_media();
    wp_enqueue_script('vue-js', plugin_dir_url(IRE_PLUGIN_FILE) . 'dist/assets/index.js', [], null, true);
    wp_enqueue_style('vue-styles', plugin_dir_url(IRE_PLUGIN_FILE) . 'dist/assets/index.css');

    wp_localize_script('vue-js', 'irePlugin', array(
        'nonce' => wp_create_nonce('ire_nonce'),
        'ajax_url' => admin_url('admin-ajax.php'),
        'plugin_url' => PLUGIN_URL
    ));
}

add_action('wp_enqueue_scripts', 'ire_enqueue_vue_scripts');




/**
 *  To use import in js
 */

function ire_add_module_type_attribute($tag, $handle)
{
    if ($handle !== 'vue-js') {
        return $tag;
    }

    return str_replace('src', 'type="module" defer="defer" src', $tag);
}

add_filter('script_loader_tag', 'ire_add_module_type_attribute', 10, 2);
