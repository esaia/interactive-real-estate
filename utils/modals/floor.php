<?php

class IreFloor
{

    protected $wpdb;
    protected $table_name;

    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'ire_floors';
    }

    public function get_floors($data)
    {
        check_nonce($data['nonce'], 'ire_nonce');
        has_project_id($data);


        $data = sanitize_sorting_parameters($data, ['id', 'floor_number', 'conf']);



        $offset = ($data['page'] - 1) * $data['per_page'];
        $query = $this->wpdb->prepare(
            "SELECT * FROM {$this->table_name} WHERE project_id = %d ORDER BY {$data['sort_field']} {$data['sort_order']} LIMIT %d OFFSET %d",
            $data['project_id'],
            $data['per_page'],
            $offset
        );

        $results = $this->wpdb->get_results($query, ARRAY_A);
        $total_query = $this->wpdb->prepare("SELECT COUNT(*) FROM {$this->table_name} WHERE project_id = %d", $data['project_id']);
        $total_results = $this->wpdb->get_var($total_query);

        if (is_wp_error($results)) {
            // send_json_response(false, $results->get_error_message());

            return [false,  $results->get_error_message()];
        } else {
            if ($results) {
                $results = array_map([$this, 'map_floor_data'], $results);
            }



            return [true,  [
                'data' => $results,
                'total' => $total_results,
                'page' => $data['page'],
                'per_page' => $data['per_page']
            ]];
        }
    }

    public function create_floor($data)
    {
        check_nonce($data['nonce'], 'ire_nonce');

        $required_fields = ['floor_number', 'floor_image', 'project_id'];
        $rqeuired_data = validate_and_sanitize_input($data, $required_fields);


        if (!$rqeuired_data) {
            send_json_response(false, 'Required fields are missing.');
            return;
        }


        $non_required_fields = ['title', 'conf', 'img_contain', 'svg'];
        $non_required_data = validate_and_sanitize_input($data, $non_required_fields, false);

        $non_required_data['polygon_data'] = $data['polygon_data'] ?? null;
        $non_required_data['svg'] = !empty($data['svg']) ? $data['svg'] : '';

        $data  = array_merge($non_required_data, $rqeuired_data);
        $data['img_contain'] = $data['img_contain'] === 'true' ? 1 : 0;


        if (isset($data['polygon_data'])) {
            $data['polygon_data'] = handle_json_data($data['polygon_data']);
        }


        $this->wpdb->insert($this->table_name, $data);

        if ($this->wpdb->last_error) {

            if ($this->wpdb->last_error && strpos($this->wpdb->last_error, 'Duplicate entry') !== false) {
                send_json_response(false, 'Floor number already exists for this project.');
            } else {
                send_json_response(false, 'Database error: ' . $this->wpdb->last_error);
            }
        } else {
            $new_floor_id = $this->wpdb->insert_id;

            $new_floor =  get($this->table_name, $new_floor_id);
            $this->prepare_floor_data($new_floor);
            send_json_response(true, $new_floor);
        }
    }

    public function update_floor($data)
    {
        check_nonce($data['nonce'], 'ire_nonce');

        $floor_id = isset($data['floor_id']) ? intval($data['floor_id']) : null;

        if (!$floor_id) {
            send_json_response(false, 'floor_id is required');
            return;
        }

        $keys = ['floor_number', 'title', 'conf', 'floor_image', 'polygon_data', 'svg', 'img_contain'];
        $params = array_filter($data, function ($key) use ($keys) {
            return in_array($key, $keys);
        }, ARRAY_FILTER_USE_KEY);


        $params['polygon_data'] = handle_json_data($params['polygon_data'] ?? '');
        $params['img_contain'] = $params['img_contain'] === 'true' ? 1 : 0;

        $where = ['id' => $floor_id];
        $this->wpdb->update($this->table_name, $params, $where);

        if ($this->wpdb->last_error) {
            if ($this->wpdb->last_error && strpos($this->wpdb->last_error, 'Duplicate entry') !== false) {
                send_json_response(false, 'Floor number already exists for this project.');
            } else {
                send_json_response(false, 'Database error: ' . $this->wpdb->last_error);
            }
        } else {
            send_json_response(true, 'Floor updated successfully');
        }
    }

    public function delete_floor($data)
    {
        check_nonce($data['nonce'], 'ire_nonce');

        $floor_id = isset($data['floor_id']) ? intval($data['floor_id']) : null;

        if (!$floor_id) {
            send_json_response(false, 'floor_id is required');
            return;
        }

        $delete_result = $this->wpdb->delete($this->table_name, ['id' => $floor_id]);

        if ($delete_result) {
            send_json_response(true, 'Floor deleted successfully');
        } else {
            send_json_response(false, 'Database error: ' . $this->wpdb->last_error);
        }
    }

    private function map_floor_data($item)
    {
        if ($item['polygon_data']) {
            $item['polygon_data'] = handle_json_data($item['polygon_data']);
        }
        $item['img_contain'] =  $item['img_contain'] == 1;
        $item['floor_image'] = [get_image_instance($item['floor_image'])];
        return $item;
    }

    private function prepare_floor_data(&$floor)
    {
        if (isset($floor->polygon_data)) {
            $floor->polygon_data = handle_json_data($floor->polygon_data);
        }
        $floor->img_contain = $floor->img_contain == 1;
        $floor->floor_image = [get_image_instance($floor->floor_image)];
    }
}


// Initialize the class
$floor = new IreFloor();

// Action functions
function ire_get_floors()
{
    global $floor;
    $results = $floor->get_floors($_POST);


    if (!$results[0]) {

        send_json_response(false, $results[1]);
    } else {
        send_json_response(true, $results[1]);
    }
}

function ire_create_floor()
{
    global $floor;
    $floor->create_floor($_POST);
}

function ire_update_floor()
{
    global $floor;
    $floor->update_floor($_POST);
}

function ire_delete_floor()
{
    global $floor;
    $floor->delete_floor($_POST);
}

// Add action hooks
add_action('wp_ajax_get_floors', 'ire_get_floors');
add_action('wp_ajax_create_floor', 'ire_create_floor');
add_action('wp_ajax_update_floor', 'ire_update_floor');
add_action('wp_ajax_delete_floor', 'ire_delete_floor');
