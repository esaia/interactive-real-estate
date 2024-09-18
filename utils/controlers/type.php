<?php




add_action('wp_ajax_get_types', 'ire_get_types');

function ire_get_types()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'ire_types';

    ire_check_nonce($_POST['nonce'], 'ire_nonce');


    $non_required_fields = ['project_id', 'sort_field', 'sort_order', 'page', 'per_page'];
    $data = validate_and_sanitize_input($_POST, $non_required_fields, false);

    $valid_sort_fields = ['id', 'title'];
    $valid_sort_orders = ['ASC', 'DESC'];


    if (!in_array($data['sort_field'], $valid_sort_fields)) {
        $data['sort_field'] = 'id'; // Default
    }
    if (!in_array($data['sort_order'], $valid_sort_orders)) {
        $data['sort_order'] = 'ASC'; // Default
    }

    if ($data['project_id'] > 0) {
        $offset = ($data['page'] - 1) * $data['per_page'];
        $query = $wpdb->prepare(
            "SELECT * FROM $table_name WHERE project_id = %d ORDER BY " . esc_sql($data['sort_field']) . " " . esc_sql($data['sort_order']) . " LIMIT %d OFFSET %d",
            $data['project_id'],
            $data['per_page'],
            $offset
        );

        $results = $wpdb->get_results($query, ARRAY_A);

        $total_query = $wpdb->prepare(
            "SELECT COUNT(*) FROM $table_name WHERE project_id = %d",
            $data['project_id']
        );
        $total_results = $wpdb->get_var($total_query);

        if (is_wp_error($results)) {
            send_json_response(false, $results->get_error_message());
        } else {
            if ($results) {
                $results = array_map(function ($item) {
                    if ($item['image_2d']) {
                        $item['image_2d'] = [get_image_instance($item['image_2d'])];
                    }

                    if ($item['image_3d']) {
                        $item['image_3d'] = [get_image_instance($item['image_3d'])];
                    }

                    if ($item['gallery']) {
                        $gallery_ids = handle_json_data($item['gallery']);
                        $item['gallery'] = [];

                        foreach ($gallery_ids as $gallery_id) {
                            $item['gallery'][] = get_image_instance($gallery_id);
                        }
                    }




                    return $item;
                }, $results);
            }

            send_json_response(true, [
                'data' => $results,
                'total' => $total_results,
                'page' => $data['page'],
                'per_page' => $data['per_page']
            ]);
        }
    } else {
        send_json_response(false, 'Invalid project ID');
    }
}



add_action('wp_ajax_create_type', 'ire_create_type');

function ire_create_type()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'ire_types';

    ire_check_nonce($_POST['nonce'], 'ire_nonce');

    $required_fields = ['title', 'project_id'];
    $required_data = validate_and_sanitize_input($_POST, $required_fields);


    if (!$required_data) {
        send_json_response(false, 'Required fields are missing.');
        return;
    }



    $non_required_fields = ['teaser', 'image_2d', 'image_3d', 'area_m2', 'rooms_count'];
    $non_required_data = validate_and_sanitize_input($_POST, $non_required_fields, false);


    if ($_POST['gallery']) {
        $non_required_data['gallery'] = handle_json_data($_POST['gallery']);
    }


    $data = array_merge($required_data, $non_required_data);


    $wpdb->insert($table_name, $data);


    if ($wpdb->last_error) {
        send_json_response(false, 'Database error');
    } else {
        $new_type_id = $wpdb->insert_id;
        $new_type = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE id = %d",
            $new_type_id
        ));



        send_json_response(true, $new_type);
    }
}




add_action('wp_ajax_update_type', 'ire_update_type');

function ire_update_type()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'ire_types';

    ire_check_nonce($_POST['nonce'], 'ire_nonce');

    $type_id = isset($_POST['type_id']) ? intval($_POST['type_id']) : null;

    if (!$type_id) {
        send_json_response(false, 'type_id is required');
        return;
    }

    $keys = ['title', 'teaser', 'image_2d', 'image_3d', 'area_m2', 'rooms_count'];

    $params = validate_and_sanitize_input($_POST, $keys, false);


    if ($_POST['gallery']) {
        $params['gallery'] = handle_json_data($_POST['gallery']);
    }

    $where = array('id' => $type_id);
    $wpdb->update($table_name, $params, $where);

    if ($wpdb->last_error) {
        send_json_response(false, 'Database error');
    } else {
        send_json_response(true, 'Floor updated successfully');
    }
}



add_action('wp_ajax_delete_type', 'ire_delete_type');

function ire_delete_type()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'ire_types';

    ire_check_nonce($_POST['nonce'], 'ire_nonce');

    $type_id = isset($_POST['type_id']) ? intval($_POST['type_id']) : null;

    if (!$type_id) {
        send_json_response(false, 'type_id is required');
        return;
    }

    $delete_result = $wpdb->delete($table_name, ['id' => $type_id]);



    if ($delete_result) {
        send_json_response(true, 'Type deleted successfully');
    } else {
        send_json_response(false, 'Database error: ' . $wpdb->last_error);
    }
}
