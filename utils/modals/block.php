<?php

class IreBlock
{

    protected $wpdb;
    protected $table_name;

    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'ire_blocks';
    }

    public function get_block($data)
    {

        check_nonce($data['nonce'], 'ire_nonce');
        has_project_id($data);

        $data = sanitize_sorting_parameters($data, ['id', 'title', 'conf']);

        // Base query for fetching blocks
        $query = "SELECT * FROM {$this->table_name} WHERE project_id = %d";
        $params = [$data['project_id']];

        // Search filter
        if (!empty($data['search'])) {
            $query .= " AND (title LIKE %s OR id LIKE %s)";
            $searchTerm = '%' . $data['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Add ordering and pagination
        $query .= " ORDER BY {$data['sort_field']} {$data['sort_order']} LIMIT %d OFFSET %d";
        $params[] = $data['per_page'];
        $params[] = $data['offset'];

        // Prepare and execute the main query
        $query = $this->wpdb->prepare($query, ...$params);
        $results = $this->wpdb->get_results($query, ARRAY_A);

        // Create a total count query
        $total_query = "SELECT COUNT(*) FROM {$this->table_name} WHERE project_id = %d";
        $total_params = [$data['project_id']];

        // Apply the same filters for total count
        if (!empty($data['search'])) {
            $total_query .= " AND (title LIKE %s OR id LIKE %s)";
            $total_params[] = $searchTerm;
            $total_params[] = $searchTerm;
        }


        // Prepare and execute the total count query
        $total_query = $this->wpdb->prepare($total_query, ...$total_params);
        $total_results = $this->wpdb->get_var($total_query);


        if (is_wp_error($results)) {
            return [false,  $results->get_error_message()];
        } else {
            if ($results) {
                $results = array_map([$this, 'map_block_data'], $results);
            }

            return [true,  [
                'data' => $results,
                'total' => $total_results,
                'page' => $data['page'],
                'per_page' => $data['per_page']
            ]];
        }
    }

    public function create_block($data)
    {
        check_nonce($data['nonce'], 'ire_nonce');
        has_project_id($data);


        $required_fields = ['title', 'block_image', 'project_id'];
        $required_data = check_required_data($data, $required_fields);

        $non_required_fields = ['conf', 'polygon_data', 'svg', 'img_contain'];
        $non_required_data = validate_and_sanitize_input($data, $non_required_fields, false);

        $non_required_data['polygon_data'] = $data['polygon_data'] ?? null;
        $non_required_data['svg'] = !empty($data['svg']) ? $data['svg'] : '';

        $data  = array_merge($non_required_data, $required_data);
        $data['img_contain'] = isset($data['img_contain']) && $data['img_contain'] === 'true' ? 1 : 0;


        if (isset($data['polygon_data'])) {
            $data['polygon_data'] = handle_json_data($data['polygon_data']);
        }

        $this->wpdb->insert($this->table_name, $data);

        if ($this->wpdb->last_error) {
            database_duplicate_error($this->wpdb, 'Block number already exists for this project.');
        } else {
            $new_block_id = $this->wpdb->insert_id;

            $new_block =  get($this->table_name, $new_block_id);
            $this->prepare_block_data($new_block);
            send_json_response(true, $new_block);
        }
    }

    public function update_block($data)
    {
        check_nonce($data['nonce'], 'ire_nonce');

        $block_id = isset($data['block_id']) ? intval($data['block_id']) : null;

        if (!$block_id) {
            send_json_response(false, 'block_id is required');
            return;
        }

        $required_fields = ['title', 'block_image'];
        $required_data = check_required_data($data, $required_fields);

        $non_required_fields = ['conf', 'polygon_data', 'svg', 'img_contain'];
        $non_required_data = validate_and_sanitize_input($data, $non_required_fields, false);

        $params  = array_merge($non_required_data, $required_data);

        if (isset($data['svg'])) {
            $params['svg'] = $data['svg'];
        }

        if (empty($params['conf'])) {
            $params['conf'] = null;
        }

        $params['polygon_data'] = handle_json_data($data['polygon_data'] ?? '');
        $params['img_contain'] = $data['img_contain'] === 'true' ? 1 : 0;


        $where = ['id' => $block_id];
        $this->wpdb->update($this->table_name, $params, $where);

        if ($this->wpdb->last_error) {
            database_duplicate_error($this->wpdb, 'Block number already exists for this project.');
        } else {
            send_json_response(true, 'Floor updated successfully');
        }
    }

    public function delete_block($data)
    {
        check_nonce($data['nonce'], 'ire_nonce');

        $block_id = isset($data['block_id']) ? intval($data['block_id']) : null;

        if (!$block_id) {
            send_json_response(false, 'block_ic is required');
            return;
        }

        $delete_result = $this->wpdb->delete($this->table_name, ['id' => $block_id]);

        if ($delete_result) {
            send_json_response(true, 'Floor deleted successfully');
        } else {
            send_json_response(false, 'Database error: ' . $this->wpdb->last_error);
        }
    }

    private function map_block_data($item)
    {
        if ($item['polygon_data']) {
            $item['polygon_data'] = handle_json_data($item['polygon_data']);
        }
        $item['img_contain'] =  $item['img_contain'] == 1;
        $item['block_image'] = [get_image_instance($item['block_image'])];
        return $item;
    }

    private function prepare_block_data(&$floor)
    {
        if (isset($floor->polygon_data)) {
            $floor->polygon_data = handle_json_data($floor->polygon_data);
        }
        $floor->img_contain = $floor->img_contain == 1;
        $floor->block_image = [get_image_instance($floor->block_image)];
    }
}


// Initialize the class
$block = new IreBlock();

// Action functions
function ire_get_blocks()
{
    global $block;
    $results = $block->get_block($_POST);


    if (!$results[0]) {

        send_json_response(false, $results[1]);
    } else {
        send_json_response(true, $results[1]);
    }
}

function ire_create_block()
{
    global $block;
    $block->create_block($_POST);
}

function ire_update_block()
{
    global $block;
    $block->update_block($_POST);
}

function ire_delete_block()
{
    global $block;
    $block->delete_block($_POST);
}

// Add action hooks
add_action('wp_ajax_ire_get_blocks', 'ire_get_blocks');
add_action('wp_ajax_ire_create_block', 'ire_create_block');
add_action('wp_ajax_ire_update_block', 'ire_update_block');
add_action('wp_ajax_ire_delete_block', 'ire_delete_block');
