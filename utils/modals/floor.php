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

        $data = sanitize_sorting_parameters($data, ['id', 'floor_number', 'conf', 'block_id']);
        $offset = ($data['page'] - 1) * $data['per_page'];

        // Base query for fetching records
        $query = "SELECT * FROM {$this->table_name} WHERE project_id = %d";
        $params = [$data['project_id']];

        // Search filter
        if (!empty($data['search'])) {
            $query .= " AND (title LIKE %s OR id LIKE %s OR floor_number LIKE %s)";
            $searchTerm = '%' . $data['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Filter by block if provided
        if (!empty($data['block'])) {
            $query .= " AND block_id = %d";
            $params[] = $data['block'];
        }

        // Add ordering and pagination
        $query .= " ORDER BY {$data['sort_field']} {$data['sort_order']} LIMIT %d OFFSET %d";
        $params[] = $data['per_page'];
        $params[] = $offset;

        // Prepare and execute the main query
        $query = $this->wpdb->prepare($query, ...$params);
        $results = $this->wpdb->get_results($query, ARRAY_A);

        // Create a total count query
        $total_query = "SELECT COUNT(*) FROM {$this->table_name} WHERE project_id = %d";
        $total_params = [$data['project_id']];

        // Apply the same filters for total count
        if (!empty($data['search'])) {
            $total_query .= " AND (title LIKE %s OR id LIKE %s OR floor_number LIKE %s)";
            $total_params[] = $searchTerm;
            $total_params[] = $searchTerm;
            $total_params[] = $searchTerm;
        }

        if (!empty($data['block'])) {
            $total_query .= " AND block_id = %d";
            $total_params[] = $data['block'];
        }

        // Prepare and execute the total count query
        $total_query = $this->wpdb->prepare($total_query, ...$total_params);
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


        $non_required_fields = ['title', 'conf', 'img_contain', 'svg', 'block_id'];
        $non_required_data = validate_and_sanitize_input($data, $non_required_fields, false);

        $non_required_data['polygon_data'] = $data['polygon_data'] ?? null;
        $non_required_data['svg'] = !empty($data['svg']) ? $data['svg'] : '';

        $data  = array_merge($non_required_data, $rqeuired_data);
        $data['img_contain'] = isset($data['img_contain']) &&  $data['img_contain'] === 'true' ? 1 : 0;

        if (isset($data['polygon_data'])) {
            $data['polygon_data'] = handle_json_data($data['polygon_data']);
        }


        $this->check_floor_exists_or_not($data['project_id'], $data['floor_number'], $data['block_id']);

        $this->wpdb->insert($this->table_name, $data);

        if ($this->wpdb->last_error) {

            database_duplicate_error($this->wpdb, 'Floor number already exists for this project.');
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

        $keys = ['floor_number', 'title', 'conf', 'floor_image', 'polygon_data', 'svg', 'img_contain', 'block_id'];

        $params = array_filter($data, function ($key) use ($keys) {
            return in_array($key, $keys);
        }, ARRAY_FILTER_USE_KEY);


        if (empty($params['block_id'])) {
            $params['block_id'] = null;
        }


        if (empty($params['conf'])) {
            $params['conf'] = null;
        }


        $params['polygon_data'] = handle_json_data($params['polygon_data'] ?? '');
        $params['img_contain'] = isset($params['img_contain']) &&  $params['img_contain'] === 'true' ? 1 : 0;


        $where = ['id' => $floor_id];
        $this->wpdb->update($this->table_name, $params, $where);

        if ($this->wpdb->last_error) {

            database_duplicate_error($this->wpdb, 'Floor number already exists for this project.');
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

    public function check_floor_exists_or_not($project_id, $floor_number, $block_id)
    {

        $params = [];
        $query =  "SELECT * FROM {$this->table_name} WHERE project_id = %d AND floor_number = %d";
        $params[] = $project_id;
        $params[] = $floor_number;

        if ($block_id) {
            $query .= "AND block_id %d";
            $params[] = $block_id;
        }

        $query = $this->wpdb->prepare($query, ...$params);
        $result = $this->wpdb->get_row($query, ARRAY_A);


        if (isset($result)) {
            send_json_response(false, 'Floor number already exists for this project.');
        }
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
