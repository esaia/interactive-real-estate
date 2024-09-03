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



add_action('wp_ajax_update_project', 'ire_update_project');


function ire_update_project()
{

    global $wpdb;

    $project_id = intval($_POST['projectId']);
    $svg = $_POST['svg'];

    $table_name = $wpdb->prefix . 'ire_projects';

    error_log($svg);

    $data = array(
        // 'title' => $title,
        'svg' => $svg,
        // 'project_image' => $project_image,
        // 'slug' => $slug,
    );

    $where = array('id' => $project_id);

    $updated = $wpdb->update($table_name, $data, $where);





    if ($updated !== false) {
        wp_send_json_success('');
    } else {
        wp_send_json_error('No projects found.');
    }
}


add_action('wp_ajax_get_projects', 'ire_get_projects');



function ire_get_projects()
{

    global $wpdb;
    $table_name = $wpdb->prefix . 'ire_projects';
    $project_id = $_POST['projectId'];

    ire_check_nonce($_POST['nonce'], 'ire_nonce');

    if (isset($project_id)) {
        $result = $wpdb->get_row("SELECT * FROM $table_name WHERE id = $project_id ORDER BY id DESC");
        error_log(print_r($result, true));
    } else {
        $result = $wpdb->get_results("SELECT * FROM $table_name ORDER BY id DESC");
        $result = array_map(function ($item) {
            $item->project_image = wp_get_attachment_image_url($item->project_image, 90);
            return $item;
        }, $result);
    }






    if (isset($result)) {
        wp_send_json_success($result);
    } else {
        wp_send_json_error('No projects found.');
    }
}
