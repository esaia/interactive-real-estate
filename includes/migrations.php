<?php

if (!defined('ABSPATH')) {
    exit;
}

require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

register_activation_hook(IREP_PLUGIN_FILE, 'irep_create_tables');

// Define a function to create tables if they don't already exist
function irep_create_tables()
{
    global $wpdb;

    $charset_collate = $wpdb->get_charset_collate();
    $isSQLite = !($wpdb->dbh instanceof mysqli); // Check if using SQLite

    // Table for projects
    $projects_table_name = $wpdb->prefix . 'irep_projects';
    $projects_sql = "
    CREATE TABLE $projects_table_name (
        id mediumint(9) NOT NULL " . ($isSQLite ? "INTEGER PRIMARY KEY AUTOINCREMENT" : "AUTO_INCREMENT") . ",
        title VARCHAR(255) NOT NULL,
        svg LONGTEXT,
        project_image INT NOT NULL,
        slug VARCHAR(255),
        polygon_data " . ($isSQLite ? "TEXT" : "JSON") . ",
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    // Check if projects table exists, if not, create it
    if (!$wpdb->get_var("SHOW TABLES LIKE '$projects_table_name'")) {
        dbDelta($projects_sql);
    }

    // Table for blocks
    $blocks_table_name = $wpdb->prefix . 'irep_blocks';
    $blocks_sql = "
    CREATE TABLE $blocks_table_name (
        id mediumint(9) NOT NULL " . ($isSQLite ? "INTEGER PRIMARY KEY AUTOINCREMENT" : "AUTO_INCREMENT") . ",
        title VARCHAR(255) NOT NULL,
        conf VARCHAR(255),
        block_image INT NOT NULL,
        polygon_data " . ($isSQLite ? "TEXT" : "JSON") . ",
        svg LONGTEXT,
        project_id mediumint(9) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)" .
        ($isSQLite ? '' : ", FOREIGN KEY (project_id) REFERENCES $projects_table_name(id) ON DELETE CASCADE") . "
    ) $charset_collate;";

    // Check if blocks table exists, if not, create it
    if (!$wpdb->get_var("SHOW TABLES LIKE '$blocks_table_name'")) {
        dbDelta($blocks_sql);
    }

    // Table for floors
    $floors_table_name = $wpdb->prefix . 'irep_floors';
    $floors_sql = "
    CREATE TABLE $floors_table_name (
        id mediumint(9) NOT NULL " . ($isSQLite ? "INTEGER PRIMARY KEY AUTOINCREMENT" : "AUTO_INCREMENT") . ",
        floor_number INT NOT NULL,
        title VARCHAR(255),
        conf VARCHAR(255),
        floor_image INT NOT NULL,
        polygon_data " . ($isSQLite ? "TEXT" : "JSON") . ",
        svg LONGTEXT NOT NULL,
        project_id mediumint(9) NOT NULL,
        block_id mediumint(9),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_floor (project_id, floor_number, block_id),
        PRIMARY KEY (id)" .
        ($isSQLite ? '' : ", FOREIGN KEY (block_id) REFERENCES $blocks_table_name(id) ON DELETE CASCADE, FOREIGN KEY (project_id) REFERENCES $projects_table_name(id) ON DELETE CASCADE") . "
    ) $charset_collate;";

    // Check if floors table exists, if not, create it
    if (!$wpdb->get_var("SHOW TABLES LIKE '$floors_table_name'")) {
        dbDelta($floors_sql);
    }

    // Table for types
    $types_table_name = $wpdb->prefix . 'irep_types';
    $types_sql = "
    CREATE TABLE $types_table_name (
        id mediumint(9) NOT NULL " . ($isSQLite ? "INTEGER PRIMARY KEY AUTOINCREMENT" : "AUTO_INCREMENT") . ",
        title VARCHAR(255) NOT NULL,
        teaser TEXT,
        project_id mediumint(9) NOT NULL,
        image_2d " . ($isSQLite ? "TEXT" : "JSON") . ",
        image_3d " . ($isSQLite ? "TEXT" : "JSON") . ",
        gallery " . ($isSQLite ? "TEXT" : "JSON") . ",
        area_m2 DECIMAL(10, 2),
        rooms_count INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)" .
        ($isSQLite ? '' : ", FOREIGN KEY (project_id) REFERENCES $projects_table_name(id) ON DELETE CASCADE") . "
    ) $charset_collate;";

    // Check if types table exists, if not, create it
    if (!$wpdb->get_var("SHOW TABLES LIKE '$types_table_name'")) {
        dbDelta($types_sql);
    }

    // Table for flats
    $flats_table_name = $wpdb->prefix . 'irep_flats';
    $flats_sql = "
    CREATE TABLE $flats_table_name (
        id mediumint(9) NOT NULL " . ($isSQLite ? "INTEGER PRIMARY KEY AUTOINCREMENT" : "AUTO_INCREMENT") . ",
        block_id mediumint(9),
        type_id mediumint(9),
        project_id mediumint(9) NOT NULL,
        floor_number mediumint(9),
        conf VARCHAR(255),
        flat_number VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        offer_price DECIMAL(10, 2),
        use_type BOOLEAN DEFAULT TRUE,
        type " . ($isSQLite ? "TEXT" : "JSON") . ",
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)" .
        ($isSQLite ? '' : ", FOREIGN KEY (project_id) REFERENCES $projects_table_name(id) ON DELETE CASCADE, FOREIGN KEY (block_id) REFERENCES $blocks_table_name(id) ON DELETE CASCADE, FOREIGN KEY (type_id) REFERENCES $types_table_name(id) ON DELETE CASCADE") . "
    ) $charset_collate;";

    // Check if flats table exists, if not, create it
    if (!$wpdb->get_var("SHOW TABLES LIKE '$flats_table_name'")) {
        dbDelta($flats_sql);
    }

    // Table for project metadata
    $meta_table_name = $wpdb->prefix . 'irep_project_meta';
    $meta_sql = "
    CREATE TABLE $meta_table_name (
        id mediumint(9) NOT NULL " . ($isSQLite ? "INTEGER PRIMARY KEY AUTOINCREMENT" : "AUTO_INCREMENT") . ",
        project_id mediumint(9) NOT NULL,
        meta_key VARCHAR(255) NOT NULL,
        meta_value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)" .
        ($isSQLite ? '' : ", FOREIGN KEY (project_id) REFERENCES $projects_table_name(id) ON DELETE CASCADE") . "
    ) $charset_collate;";

    // Check if meta table exists, if not, create it
    if (!$wpdb->get_var("SHOW TABLES LIKE '$meta_table_name'")) {
        dbDelta($meta_sql);
    }

    // Table for tooltips
    $tooltip_table_name = $wpdb->prefix . 'irep_tooltip';
    $tooltip_sql = "
    CREATE TABLE $tooltip_table_name (
        id mediumint(9) NOT NULL " . ($isSQLite ? "INTEGER PRIMARY KEY AUTOINCREMENT" : "AUTO_INCREMENT") . ",
        project_id mediumint(9) NOT NULL,
        title VARCHAR(255) NOT NULL,
        data " . ($isSQLite ? "TEXT" : "JSON") . ",
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)" .
        ($isSQLite ? '' : ", FOREIGN KEY (project_id) REFERENCES $projects_table_name(id) ON DELETE CASCADE") . "
    ) $charset_collate;";

    // Check if tooltip table exists, if not, create it
    if (!$wpdb->get_var("SHOW TABLES LIKE '$tooltip_table_name'")) {
        dbDelta($tooltip_sql);
    }
}
