<?php

add_action('wp_ajax_create_flat', 'ire_create_flat');

function ire_create_flat()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'ire_flats';

    ire_check_nonce($_POST['nonce'], 'ire_nonce');

    $required_fields = ['flat_number', 'conf', 'floor_number', 'area_m2', 'price', 'offer_price', 'rooms_count', 'type_id', 'project_id'];
    $data = validate_and_sanitize_input($_POST, $required_fields);

    if (!$data) {
        send_json_response(false, 'Required fields are missing.');
        return;
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
