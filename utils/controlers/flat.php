<?php




add_action('wp_ajax_get_flats', 'ire_get_flats');

function ire_get_flats()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'ire_flats';

    ire_check_nonce($_POST['nonce'], 'ire_nonce');


    $non_required_fields = ['project_id', 'sort_field', 'sort_order', 'page', 'per_page'];
    $data = validate_and_sanitize_input($_POST, $non_required_fields, false);

    $valid_sort_fields = ['id', 'title', 'price', 'offer_price', 'conf'];
    $valid_sort_orders = ['ASC', 'DESC'];


    if (!in_array($data['sort_field'], $valid_sort_fields)) {
        $data['sort_field'] = 'id'; // Default
    }
    if (!in_array($data['sort_order'], $valid_sort_orders)) {
        $data['sort_order'] = 'ASC'; // Default
    }
    if (!in_array($data['page'], $valid_sort_orders)) {
        $data['page'] = 1; // Default
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



add_action('wp_ajax_create_flat', 'ire_create_flat');

function ire_create_flat()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'ire_flats';

    ire_check_nonce($_POST['nonce'], 'ire_nonce');

    $required_fields = ['flat_number', 'price', 'type_id',  'floor_id', 'project_id'];
    $required_data = validate_and_sanitize_input($_POST, $required_fields);

    if (!$required_data) {
        send_json_response(false, 'Required fields are missing.');
        return;
    }

    $non_required_fields = ['offer_price', 'conf'];
    $non_required_data = validate_and_sanitize_input($_POST, $non_required_fields, false);


    $data = array_merge($required_data, $non_required_data);


    $wpdb->insert($table_name, $data);

    if ($wpdb->last_error) {
        send_json_response(false, 'Database error');
    } else {
        $new_flat_id = $wpdb->insert_id;
        $new_floor = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE id = %d",
            $new_flat_id
        ));

        if (isset($new_floor->polygon_data)) {
            $new_floor->polygon_data = handle_json_data($new_floor->polygon_data);
        }
        $new_floor->floor_image = wp_get_attachment_image_url($new_floor->floor_image, 90);

        send_json_response(true, $new_floor);
    }
}








add_action('wp_ajax_update_flat', 'ire_update_flat');

function ire_update_flat()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'ire_flats';

    ire_check_nonce($_POST['nonce'], 'ire_nonce');

    $flat_id = isset($_POST['flat_id']) ? intval($_POST['flat_id']) : null;

    if (!$flat_id) {
        send_json_response(false, 'type_id is required');
        return;
    }


    $keys = ['flat_number', 'price', 'type_id',  'floor_id', 'project_id', 'offer_price', 'conf'];
    $params = validate_and_sanitize_input($_POST, $keys, false);


    $where = array('id' => $flat_id);
    $wpdb->update($table_name, $params, $where);

    if ($wpdb->last_error) {
        send_json_response(false, 'Database error');
    } else {
        send_json_response(true, 'Floor updated successfully');
    }
}




add_action('wp_ajax_delete_flat', 'ire_delete_flat');

function ire_delete_flat()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'ire_flats';

    ire_check_nonce($_POST['nonce'], 'ire_nonce');

    $flat_id = isset($_POST['flat_id']) ? intval($_POST['flat_id']) : null;

    if (!$flat_id) {
        send_json_response(false, 'flat_id is required');
        return;
    }

    $delete_result = $wpdb->delete($table_name, ['id' => $flat_id]);



    if ($delete_result) {
        send_json_response(true, 'Flat deleted successfully');
    } else {
        send_json_response(false, 'Database error: ' . $wpdb->last_error);
    }
}
