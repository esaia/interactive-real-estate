<?php




add_action('admin_enqueue_scripts', 'ire_enqueue_scripts');

/**
 *  enque js and css scripts
 */
function ire_enqueue_scripts($hook)
{

    if ($hook !== 'toplevel_page_ire') {
        return;
    }

    wp_enqueue_media();
    wp_enqueue_style('dashicons');
    wp_enqueue_script('jquery');
    wp_enqueue_script('tailwind-css', 'https://cdn.tailwindcss.com/3.4.5', array(), null);
    wp_enqueue_style('ire-styles', plugin_dir_url(IRE_PLUGIN_FILE) . 'css/main.css');
    wp_enqueue_script('ire-script', plugin_dir_url(IRE_PLUGIN_FILE) . 'js/index.js', array('jquery'), null, true);


    wp_localize_script('ire-script', 'irePlugin', array(
        'nonce' => wp_create_nonce('ire_nonce'),
        'ajax_url' => admin_url('admin-ajax.php'),
        'plugin_url' => PLUGIN_URL
    ));
}


register_activation_hook(IRE_PLUGIN_FILE, 'ire_create_table');


/**
 *  Create tables in DB
 */
function ire_create_table()
{
    global $wpdb;


    $table_name = $wpdb->prefix . 'ire_projects';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        svg LONGTEXT NOT NULL,
        project_image INT NOT NULL,
        slug VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}


add_filter('script_loader_tag', 'add_module_type_attribute', 10, 2);

/**
 *  To use import in js
 */

function add_module_type_attribute($tag, $handle)
{
    if ($handle !== 'ire-script') {
        return $tag;
    }




    return str_replace('src', 'type="module" src', $tag);
}
