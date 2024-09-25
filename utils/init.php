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

    wp_enqueue_script('vue-js',   plugin_dir_url(IRE_PLUGIN_FILE) . 'dist/assets/index.js', [], null, true);
    wp_enqueue_style('vue-styles',   plugin_dir_url(IRE_PLUGIN_FILE) . 'dist/assets/index.css');


    // wp_enqueue_style('dashicons');
    // wp_enqueue_script('jquery');
    // wp_enqueue_script('tailwind-css', 'https://cdn.tailwindcss.com/3.4.5', array(), null);
    // wp_enqueue_style('ire-styles', plugin_dir_url(IRE_PLUGIN_FILE) . 'css/main.css');
    // wp_enqueue_script('ire-script', plugin_dir_url(IRE_PLUGIN_FILE) . 'js/index.js', array('jquery'), null, true);


    wp_localize_script('vue-js', 'irePlugin', array(
        'nonce' => wp_create_nonce('ire_nonce'),
        'ajax_url' => admin_url('admin-ajax.php'),
        'plugin_url' => PLUGIN_URL
    ));
}


register_activation_hook(IRE_PLUGIN_FILE, 'ire_create_tables');


/**
 *  Create tables in DB
 */
function ire_create_tables()
{
    global $wpdb;

    $charset_collate = $wpdb->get_charset_collate();

    // Table for projects
    $projects_table_name = $wpdb->prefix . 'ire_projects';
    $projects_sql = "CREATE TABLE $projects_table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        svg LONGTEXT NOT NULL,
        project_image INT NOT NULL,
        slug VARCHAR(255) NOT NULL,
        polygon_data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // Table for floors
    $floors_table_name = $wpdb->prefix . 'ire_floors';
    $floors_sql = "CREATE TABLE $floors_table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        floor_number INT NOT NULL,
        title VARCHAR(255),
        conf ENUM('reserved', 'sold'),
        floor_image INT NOT NULL,
        polygon_data JSON,
        svg LONGTEXT NOT NULL,
        project_id mediumint(9) NOT NULL,
        img_contain BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_floor (project_id, floor_number),
        PRIMARY KEY  (id),
        FOREIGN KEY (project_id) REFERENCES $projects_table_name(id) ON DELETE CASCADE
    ) $charset_collate;";



    // Table for types
    $types_table_name = $wpdb->prefix . 'ire_types';
    $types_sql = "CREATE TABLE $types_table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        teaser TEXT,
        project_id mediumint(9) NOT NULL,
        image_2d INT,
        image_3d INT,
        gallery JSON,
        area_m2 DECIMAL(10, 2),
        rooms_count INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (project_id) REFERENCES $projects_table_name(id) ON DELETE CASCADE
    ) $charset_collate;";


    // Table for Flats
    $flats_table_name = $wpdb->prefix . 'ire_flats';
    $flats_sql = "CREATE TABLE $flats_table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        block_id mediumint(9),
        type_id mediumint(9) NOT NULL,
        project_id mediumint(9) NOT NULL,
        floor_number mediumint(9) NOT NULL,
        conf ENUM('reserved', 'sold'),
        flat_number VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        offer_price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (project_id) REFERENCES $projects_table_name(id) ON DELETE CASCADE,
        FOREIGN KEY (type_id) REFERENCES $types_table_name(id) ON DELETE CASCADE
    ) $charset_collate;";


    // Table for Project Metadata
    $meta_table_name = $wpdb->prefix . 'ire_project_meta';
    $meta_sql = "CREATE TABLE $meta_table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        project_id mediumint(9) NOT NULL,
        meta_key VARCHAR(255) NOT NULL,
        meta_value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (project_id) REFERENCES $projects_table_name(id) ON DELETE CASCADE
    ) $charset_collate;";


    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($projects_sql);
    dbDelta($floors_sql);
    dbDelta($flats_sql);
    dbDelta($types_sql);
    dbDelta($meta_sql);
}


add_filter('script_loader_tag', 'add_module_type_attribute', 10, 2);

/**
 *  To use import in js
 */

function add_module_type_attribute($tag, $handle)
{
    if ($handle !== 'vue-js') {
        return $tag;
    }

    return str_replace('src', 'type="module" defer="defer" src', $tag);
}

function render_vue_preview_shortcode()
{


    // Start output buffering to capture HTML output
    ob_start();
?>
    <div id="ire-shortcode">
    </div>
<?php
    return ob_get_clean(); // Return the buffered content
}

add_shortcode('vue_preview', 'render_vue_preview_shortcode');

function enqueue_vue_scripts()
{
    wp_enqueue_media();
    wp_enqueue_script('vue-js',   plugin_dir_url(IRE_PLUGIN_FILE) . 'dist/assets/index.js', [], null, true);
    wp_enqueue_style('vue-styles',   plugin_dir_url(IRE_PLUGIN_FILE) . 'dist/assets/index.css');

    wp_localize_script('vue-js', 'irePlugin', array(
        'nonce' => wp_create_nonce('ire_nonce'),
        'ajax_url' => admin_url('admin-ajax.php'),
        'plugin_url' => PLUGIN_URL
    ));
}

add_action('wp_enqueue_scripts', 'enqueue_vue_scripts');
