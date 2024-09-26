<?php

class IreType
{



    protected $wpdb;
    protected $table_name;

    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'ire_types';
    }

    public function get_types($data)
    {
        check_nonce($data['nonce'], 'ire_nonce');
        has_project_id($data);
        $data = sanitize_sorting_parameters($data, ['id', 'title', 'area_m2']);

        $offset = ($data['page'] - 1) * $data['per_page'];
        $query = $this->wpdb->prepare(
            "SELECT * FROM {$this->table_name} WHERE project_id = %d ORDER BY {$data['sort_field']} {$data['sort_order']} LIMIT %d OFFSET %d",
            $data['project_id'],
            $data['per_page'],
            $offset
        );

        $results = $this->wpdb->get_results($query, ARRAY_A);
        $total_results = $this->wpdb->get_var($this->wpdb->prepare("SELECT COUNT(*) FROM {$this->table_name} WHERE project_id = %d", $data['project_id']));

        if (is_wp_error($results)) {
            return [false,  $results->get_error_message()];
        } else {
            if ($results) {
                $results = array_map([$this, 'map_images'], $results);
            }

            return [true, [
                'data' => $results,
                'total' => $total_results,
                'page' => $data['page'],
                'per_page' => $data['per_page']
            ]];
        }
    }

    public function create_type($data)
    {
        check_nonce($data['nonce'], 'ire_nonce');
        has_project_id($data);


        $required_data = validate_and_sanitize_input($data, ['title', 'project_id']);

        if (!$required_data) {
            send_json_response(false, 'Required fields are missing.');
            return;
        }

        $non_required_fields = ['teaser', 'image_2d', 'image_3d', 'area_m2', 'rooms_count'];
        $non_required_data = validate_and_sanitize_input($data, $non_required_fields, false);

        if (!empty($data['gallery'])) {
            $non_required_data['gallery'] = handle_json_data($data['gallery']);
        }

        $data = array_merge($required_data, $non_required_data);


        $this->wpdb->insert($this->table_name, $data);

        if ($this->wpdb->last_error) {
            send_json_response(false, 'Database error');
        } else {
            $new_type_id = $this->wpdb->insert_id;
            $new_type =  get($this->table_name, $new_type_id);

            send_json_response(true, $new_type);
        }
    }

    public function update_type($data)
    {
        check_nonce($data['nonce'], 'ire_nonce');

        $type_id = isset($data['type_id']) ? intval($data['type_id']) : null;
        if (!$type_id) {
            send_json_response(false, 'type_id is required');
            return;
        }

        $keys = ['title', 'teaser', 'image_2d', 'image_3d', 'area_m2', 'rooms_count'];
        $params = validate_and_sanitize_input($data, $keys, false);

        if (!empty($data['gallery'])) {
            $params['gallery'] = handle_json_data($data['gallery']);
        }

        $params['image_2d'] ??= null;
        $params['image_3d'] ??= null;
        $params['gallery'] ??= null;

        $where = ['id' => $type_id];
        $this->wpdb->update($this->table_name, $params, $where);

        if ($this->wpdb->last_error) {
            send_json_response(false, 'Database error');
        } else {
            send_json_response(true, 'Type updated successfully');
        }
    }

    public function delete_type($data)
    {
        check_nonce($data['nonce'], 'ire_nonce');

        $type_id = isset($data['type_id']) ? intval($data['type_id']) : null;
        if (!$type_id) {
            send_json_response(false, 'type_id is required');
            return;
        }

        $delete_result = $this->wpdb->delete($this->table_name, ['id' => $type_id]);

        if ($delete_result) {
            send_json_response(true, 'Type deleted successfully');
        } else {
            send_json_response(false, 'Database error: ' . $this->wpdb->last_error);
        }
    }

    private function map_images($item)
    {
        if ($item['image_2d']) {
            $item['image_2d'] = [get_image_instance($item['image_2d'])];
        }

        if ($item['image_3d']) {
            $item['image_3d'] = [get_image_instance($item['image_3d'])];
        }

        if ($item['gallery']) {
            $gallery_ids = handle_json_data($item['gallery']);
            $item['gallery'] = array_map('get_image_instance', $gallery_ids);
        }

        return $item;
    }
}


// Initialize the class
$type = new IreType();

// Action functions
function ire_get_types()
{
    global $type;

    $results =  $type->get_types($_POST);

    if (!$results[0]) {
        send_json_response(false, $results[1]);
    } else {
        send_json_response(true, $results[1]);
    }
}

function ire_create_type()
{
    global $type;
    $type->create_type($_POST);
}

function ire_update_type()
{
    global $type;
    $type->update_type($_POST);
}

function ire_delete_type()
{
    global $type;
    $type->delete_type($_POST);
}

// Add action hooks
add_action('wp_ajax_get_types', 'ire_get_types');
add_action('wp_ajax_create_type', 'ire_create_type');
add_action('wp_ajax_update_type', 'ire_update_type');
add_action('wp_ajax_delete_type', 'ire_delete_type');
