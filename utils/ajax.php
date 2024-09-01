<?php

add_action('wp_ajax_create_project', 'ire_create_project');

function ire_create_project()
{

    global $wpdb;
    $table_name = $wpdb->prefix . 'ire_projects';


    ire_check_nonce($_POST['nonce'], 'ire_nonce');



    // Sanitize and validate input
    $title = isset($_POST['title']) ? sanitize_text_field($_POST['title']) : '';
    $project_image = isset($_POST['project_image']['id']) ? sanitize_text_field($_POST['project_image']['id']) : '';
    $slug = sanitize_title($title);

    // Insert into database
    $wpdb->insert(
        $table_name,
        array(
            'title' => $title,
            'project_image' => $project_image,
            'svg' => '',
            'slug' => $slug
        )
    );


    if ($wpdb->last_error) {
        wp_send_json_error('Database error');
    } else {
        wp_send_json_success('Project added');
    }
}



add_action('wp_ajax_get_projects', 'ire_get_projects');

function ire_get_projects()
{

    global $wpdb;
    $table_name = $wpdb->prefix . 'ire_projects';


    ire_check_nonce($_POST['nonce'], 'ire_nonce');

    $results = $wpdb->get_results("SELECT * FROM $table_name ORDER BY id DESC");


    $transformed_results = array_map(function ($item) {
        $item->project_image = wp_get_attachment_image_url($item->project_image, 90);
        return $item;
    }, $results);


    if (!empty($results)) {
        wp_send_json_success($transformed_results);
    } else {
        wp_send_json_error('No projects found.');
    }
}


add_action('wp_ajax_get_image_url', 'get_image_url_by_id_ajax');
