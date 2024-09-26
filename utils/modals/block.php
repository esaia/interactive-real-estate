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
        $offset = ($data['page'] - 1) * $data['per_page'];


        $query =  "SELECT * FROM {$this->table_name} WHERE project_id = %d";
        $params = [$data['project_id']];

        if (!empty($data['search'])) {
            $query .= " AND (title LIKE %s OR id LIKE %s)";
            $searchTerm = '%' . $data['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $query .= " ORDER BY {$data['sort_field']} {$data['sort_order']} LIMIT %d OFFSET %d";
        $params[] =  $data['per_page'];
        $params[] =   $offset;

        $query = $this->wpdb->prepare(
            $query,
            ...$params
        );

        $results = $this->wpdb->get_results($query, ARRAY_A);
        $total_query = $this->wpdb->prepare("SELECT COUNT(*) FROM {$this->table_name} WHERE project_id = %d", $data['project_id']);
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
        $rqeuired_data = validate_and_sanitize_input($data, $required_fields);


        if (!$rqeuired_data) {
            send_json_response(false, 'Required fields are missing.');
            return;
        }


        $non_required_fields = ['conf', 'polygon_data', 'svg'];
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


        $non_required_fields = ['title', 'conf', 'block_image', 'polygon_data', 'svg', 'img_contain'];
        $params = validate_and_sanitize_input($data, $non_required_fields, false);

        $params['polygon_data'] = handle_json_data($params['polygon_data'] ?? '');
        $params['img_contain'] = $params['img_contain'] === 'true' ? 1 : 0;

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

        $block_ic = isset($data['block_ic']) ? intval($data['block_ic']) : null;

        if (!$block_ic) {
            send_json_response(false, 'block_ic is required');
            return;
        }

        $delete_result = $this->wpdb->delete($this->table_name, ['id' => $block_ic]);

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
        $item['floor_image'] = [get_image_instance($item['floor_image'])];
        return $item;
    }

    private function prepare_block_data(&$floor)
    {
        if (isset($floor->polygon_data)) {
            $floor->polygon_data = handle_json_data($floor->polygon_data);
        }
        $floor->img_contain = $floor->img_contain == 1;
        $floor->floor_image = [get_image_instance($floor->floor_image)];
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
add_action('wp_ajax_get_block', 'ire_get_blocks');
add_action('wp_ajax_create_block', 'ire_create_block');
add_action('wp_ajax_update_block', 'ire_update_block');
add_action('wp_ajax_delete_block', 'ire_delete_block');
