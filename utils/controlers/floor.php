
<?php

add_action('wp_ajax_create_floor', 'ire_create_floor');

function ire_create_floor()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'ire_floors';

    ire_check_nonce($_POST['nonce'], 'ire_nonce');

    $required_fields = ['floor_number', 'floor_image', 'project_id'];
    $data = validate_and_sanitize_input($_POST, $required_fields);

    if (!$data) {
        send_json_response(false, 'Required fields are missing.');
        return;
    }


    $data['title'] = isset($_POST['title']) ? $_POST['title'] : null;
    $data['conf'] = isset($_POST['conf']) ? $_POST['conf'] : null;


    if (isset($_POST['polygon_data']) && isset($_POST['svg'])) {
        $data['polygon_data'] = handle_json_data($_POST['polygon_data']);
        $data['svg'] = isset($_POST['svg']) ? $_POST['svg'] : null;
    }

    $wpdb->insert($table_name, $data);

    if ($wpdb->last_error) {
        send_json_response(false, 'Database error');
    } else {
        $new_floor_id = $wpdb->insert_id;
        $new_floor = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE id = %d",
            $new_floor_id
        ));

        if (isset($new_floor->polygon_data)) {
            $new_floor->polygon_data = handle_json_data($new_floor->polygon_data);
        }
        $new_floor->floor_image = wp_get_attachment_image_url($new_floor->floor_image, 90);

        send_json_response(true, $new_floor);
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

    $valid_sort_fields = ['id', 'floor_number', 'conf'];
    $valid_sort_orders = ['ASC', 'DESC'];

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

        $total_query = $wpdb->prepare(
            "SELECT COUNT(*) FROM $table_name WHERE project_id = %d",
            $project_id
        );
        $total_results = $wpdb->get_var($total_query);

        if (is_wp_error($results)) {
            send_json_response(false, $results->get_error_message());
        } else {
            if ($results) {
                $results = array_map(function ($item) {
                    if ($item['polygon_data']) {
                        $item['polygon_data'] = handle_json_data($item['polygon_data']);
                    }
                    $item['floor_image_id'] = $item['floor_image'];
                    $item['floor_image'] = wp_get_attachment_image_url($item['floor_image'], 90);
                    return $item;
                }, $results);
            }

            send_json_response(true, [
                'data' => $results,
                'total' => $total_results,
                'page' => $page,
                'per_page' => $per_page
            ]);
        }
    } else {
        send_json_response(false, 'Invalid project ID');
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
        send_json_response(false, 'Floor_id is required');
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

    $params['polygon_data'] = handle_json_data($params['polygon_data']);

    $where = array('id' => $floor_id);
    $wpdb->update($table_name, $params, $where);

    if ($wpdb->last_error) {
        send_json_response(false, 'Database error');
    } else {
        send_json_response(true, 'Floor updated successfully');
    }
}



add_action('wp_ajax_delete_floor', 'ire_delete_floor');

function ire_delete_floor()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'ire_floors';

    ire_check_nonce($_POST['nonce'], 'ire_nonce');

    $floor_id = isset($_POST['floor_id']) ? intval($_POST['floor_id']) : null;

    if (!$floor_id) {
        send_json_response(false, 'Floor_id is required');
        return;
    }

    $delete_result = $wpdb->delete($table_name, ['id' => $floor_id]);



    if ($delete_result) {
        send_json_response(true, 'Floor deleted successfully');
    } else {
        send_json_response(false, 'Database error: ' . $wpdb->last_error);
    }
}
