<?php

register_activation_hook(IRE_PLUGIN_FILE, 'ire_create_tables');


/**
 * Create tables in DB
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
        PRIMARY KEY (id)
        ) $charset_collate;";



    // Table for blocks
    $blocks_table_name = $wpdb->prefix . 'ire_blocks';
    $blocks_sql = "CREATE TABLE $blocks_table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        conf ENUM('reserved', 'sold'),
        block_image INT NOT NULL,
        polygon_data JSON,
        svg LONGTEXT,
        project_id mediumint(9) NOT NULL,
        img_contain BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (project_id) REFERENCES $projects_table_name(id) ON DELETE CASCADE
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
        block_id mediumint(9),
        img_contain BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_floor (project_id, floor_number, block_id),
        PRIMARY KEY (id),
        FOREIGN KEY (block_id) REFERENCES $blocks_table_name(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES $projects_table_name(id) ON DELETE CASCADE
        ) $charset_collate;";




    // Table for types
    $types_table_name = $wpdb->prefix . 'ire_types';
    $types_sql = "CREATE TABLE $types_table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        teaser TEXT,
        project_id mediumint(9) NOT NULL,
        image_2d JSON,
        image_3d JSON,
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
        type_id mediumint(9),
        project_id mediumint(9) NOT NULL,
        floor_number mediumint(9),
        conf ENUM('reserved', 'sold'),
        flat_number VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        offer_price DECIMAL(10, 2),
        use_type BOOLEAN DEFAULT TRUE,
        type json,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (project_id) REFERENCES $projects_table_name(id) ON DELETE CASCADE,
        FOREIGN KEY (block_id) REFERENCES $blocks_table_name(id) ON DELETE CASCADE,
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



    // Table for Flats
    $tooltip_table_name = $wpdb->prefix . 'ire_tooltip';
    $tooltip_sql = "CREATE TABLE $tooltip_table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        project_id mediumint(9) NOT NULL,
        title VARCHAR(255) NOT NULL,
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (project_id) REFERENCES $projects_table_name(id) ON DELETE CASCADE
        ) $charset_collate;";



    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($projects_sql);
    dbDelta($floors_sql);
    dbDelta($blocks_sql);
    dbDelta($flats_sql);
    dbDelta($types_sql);
    dbDelta($meta_sql);
    dbDelta($meta_sql);
    dbDelta($tooltip_sql);
}
