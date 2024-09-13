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



add_action('wp_ajax_create_floor', 'ire_create_floor');


function ire_create_floor()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'ire_floors';

    ire_check_nonce($_POST['nonce'], 'ire_nonce');

    $title = isset($_POST['title']) ? sanitize_text_field($_POST['title']) : '';

    $floor_number = intval($_POST['floor_number']) ?? null;
    $title = sanitize_text_field($_POST['title']) ?? null;
    $conf = $_POST['conf'] ?? null;
    $floor_image =  sanitize_text_field($_POST['floor_image']) ?? null;
    $project_id = intval($_POST['project_id']) ?? null;


    if (!$floor_number || !$floor_image || !$project_id || !$floor_image) {
        wp_send_json_error('Required fields are missing.');
    }



    $params = array(
        'floor_number' => $floor_number,
        'title' => $title,
        'conf' => $conf,
        'floor_image' => $floor_image,
        'project_id' => $project_id
    );

    // Insert into database
    $wpdb->insert(
        $table_name,
        $params
    );


    if ($wpdb->last_error) {
        wp_send_json_error('Database error');
    } else {
        $new_floor_id = $wpdb->insert_id;

        $new_floor = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE id = %d",
            $new_floor_id
        ));

        $new_floor->floor_image = wp_get_attachment_image_url($new_floor->floor_image, 90);

        wp_send_json_success($new_floor);
    }
}

add_action('wp_ajax_get_floors', 'ire_get_floors');

function ire_get_floors()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'ire_floors';

    ire_check_nonce($_POST['nonce'], 'ire_nonce');

    $project_id = isset($_POST['project_id']) && is_numeric($_POST['project_id']) ? intval($_POST['project_id']) : 0;
    $sort_field = isset($_POST['sort_field']) ? sanitize_text_field($_POST['sort_field']) : 'id';
    $sort_order = isset($_POST['sort_order']) ? strtoupper(sanitize_text_field($_POST['sort_order'])) : 'ASC';
    $page = isset($_POST['page']) && is_numeric($_POST['page']) ? intval($_POST['page']) : 1;
    $per_page = isset($_POST['per_page']) && is_numeric($_POST['per_page']) ? intval($_POST['per_page']) : 10;

    $valid_sort_fields = array('id', 'floor_number', 'conf');
    $valid_sort_orders = array('ASC', 'DESC');

    if (!in_array($sort_field, $valid_sort_fields)) {
        $sort_field = 'id'; // Default
    }
    if (!in_array($sort_order, $valid_sort_orders)) {
        $sort_order = 'ASC'; // Default
    }

    if ($project_id > 0) {
        $offset = ($page - 1) * $per_page;
        $query = $wpdb->prepare(
            "SELECT * FROM $table_name WHERE project_id = %d ORDER BY $sort_field $sort_order LIMIT %d OFFSET %d",
            $project_id,
            $per_page,
            $offset
        );

        $results = $wpdb->get_results($query, ARRAY_A);

        // Get total number of records for pagination
        $total_query = $wpdb->prepare(
            "SELECT COUNT(*) FROM $table_name WHERE project_id = %d",
            $project_id
        );
        $total_results = $wpdb->get_var($total_query);

        if (is_wp_error($results)) {
            wp_send_json_error($results->get_error_message());
        } else {


            if ($results) {

                $results =    array_map(function ($item) {
                    $item['polygon_data'] = json_decode($item['polygon_data']);
                    $item['floor_image'] = wp_get_attachment_image_url($item['floor_image'], 90);

                    return $item;
                }, $results);
            }


            wp_send_json_success(array(
                'data' => $results,
                'total' => $total_results,
                'page' => $page,
                'per_page' => $per_page
            ));
        }
    } else {
        wp_send_json_error('Invalid project ID');
    }
}


add_action('wp_ajax_update_floor', 'ire_update_floor');

function ire_update_floor()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'ire_floors';

    ire_check_nonce($_POST['nonce'], 'ire_nonce');



    $floor_id = isset($_POST['floor_id']) ? intval($_POST['floor_id']) : null;

    if (!$floor_id) {
        wp_send_json_error('Floor_id is required');

        return;
    }

    $keys = ['floor_number', 'title', 'conf', 'floor_image', 'polygon_data', 'svg'];

    $params = array_filter(
        $_POST,
        function ($key) use ($keys) {
            return in_array($key, $keys);
        },
        ARRAY_FILTER_USE_KEY
    );

    $params['polygon_data'] = json_encode($params['polygon_data']);



    $where = array('id' => $floor_id);
    $wpdb->update($table_name, $params, $where);


    if ($wpdb->last_error) {
        wp_send_json_error('No projects found.');
    } else {
        wp_send_json_success('project updated');
    }
}
