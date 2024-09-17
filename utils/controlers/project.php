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

    $project_id = isset($_POST['projectId']) ? intval($_POST['projectId']) : null;

    $keys = ['svg', 'title', 'polygon_data', 'project_image'];

    $params = array_filter(
        $_POST,
        function ($key) use ($keys) {
            return in_array($key, $keys);
        },
        ARRAY_FILTER_USE_KEY
    );


    $params['polygon_data'] = json_encode($params['polygon_data']);


    $table_name = $wpdb->prefix . 'ire_projects';


    $where = array('id' => $project_id);
    $wpdb->update($table_name, $params, $where);




    if ($wpdb->last_error) {
        wp_send_json_error('No projects found.');
    } else {
        wp_send_json_success('project updated');
    }
}


add_action('wp_ajax_get_projects', 'ire_get_projects');


function ire_get_projects()
{

    global $wpdb;
    $table_name = $wpdb->prefix . 'ire_projects';
    $project_id = isset($_POST['projectId']) ? intval($_POST['projectId']) : null;

    // Check nonce for security
    ire_check_nonce($_POST['nonce'], 'ire_nonce');

    if ($project_id) {
        $result = $wpdb->get_row("SELECT * FROM $table_name WHERE id = $project_id ORDER BY id DESC");

        if ($result) {
            $result->project_image = wp_get_attachment_image_url($result->project_image, 90);

            // Decode polygon_data as JSON
            $result->polygon_data = json_decode($result->polygon_data);
        }
    } else {
        $result = $wpdb->get_results("SELECT * FROM $table_name ORDER BY id DESC");

        if ($result) {
            $result = array_map(function ($item) {
                // Decode polygon_data as JSON
                $item->polygon_data = json_decode($item->polygon_data);
                $item->project_image = wp_get_attachment_image_url($item->project_image, 90);
                return $item;
            }, $result);
        }
    }



    if ($wpdb->last_error) {
        wp_send_json_error('No projects found.');
    } else {
        wp_send_json_success($result);
    }
}
