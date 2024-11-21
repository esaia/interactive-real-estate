<?php




class IreFlat
{


    private $wpdb;
    private $table_name;

    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'ire_flats';
    }

    public function get_flats($data)
    {
        ire_check_nonce($data['nonce'], 'ire_nonce');

        ire_has_project_id($data);
        $data = ire_sanitize_sorting_parameters($data, ['id', 'title', 'floor_number', 'price', 'offer_price', 'conf', 'block_id']);

        // Base query for fetching flats
        $query = "SELECT * FROM $this->table_name WHERE project_id = %d";
        $params = [$data['project_id']];

        // Filter by block if provided
        if (!empty($data['block']) && $data['block'] != 'null') {
            if ($data['block'] !== 'all') {
                $query .= " AND block_id = %d";
                $params[] = $data['block'];
            }
        } else {
            $query .=
                " AND block_id IS NULL";
        }

        if (!empty($data['floor'])) {
            $query .= " AND floor_number = %d";
            $params[] = $data['floor'];
        }



        // Search filter
        if (!empty($data['search'])) {
            $query .= " AND (flat_number LIKE %s OR id LIKE %s OR price LIKE %s OR offer_price LIKE %s)";
            $searchTerm = '%' . $data['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }


        $total_query = $this->wpdb->prepare($query, ...$params);
        $total_results = $this->wpdb->get_results($total_query, ARRAY_A);
        $total_results = count($total_results);

        // Add pagination
        $query .= " ORDER BY " . esc_sql($data['sort_field']) . " " . esc_sql($data['sort_order']) . " LIMIT %d OFFSET %d";
        $params[] = $data['per_page'];
        $params[] = $data['offset'];

        // Prepare and execute the main query
        $query = $this->wpdb->prepare($query, ...$params);
        $results = $this->wpdb->get_results($query, ARRAY_A);


        if (is_wp_error($results)) {
            return [false, $results->get_error_message()];
        } else if ($results) {
            $results = array_map([$this, 'map_flats'], $results);

            return [
                true,
                [
                    'data' => $results,
                    'total' => $total_results,
                    'page' => $data['page'],
                    'per_page' => $data['per_page']
                ]
            ];
        }
    }

    public function create_flat($data)
    {
        ire_check_nonce($data['nonce'], 'ire_nonce');

        $required_fields = ['flat_number', 'price', 'use_type', 'project_id'];
        $non_required_fields =  ['floor_number', 'offer_price', 'conf', 'block_id'];

        if (isset($data['use_type']) && $data['use_type'] === 'true') {
            $required_fields[] = 'type_id';
        } else {
            $non_required_fields[] = 'type_id';
        }


        $required_data = ire_check_required_data($data, $required_fields);
        $non_required_data = ire_validate_and_sanitize_input($data, $non_required_fields, false);

        $params = array_merge($required_data, $non_required_data);

        $params['type'] = ire_handle_json_data($data['type']);
        $params['use_type'] = $params['use_type'] === 'true' ? 1 : 0;

        $this->wpdb->insert($this->table_name, $params);

        if ($this->wpdb->last_error) {
            ire_send_json_response(false, 'Database error');
        } else {
            $new_flat_id = $this->wpdb->insert_id;
            $new_flat = ire_get($this->table_name, $new_flat_id);


            ire_send_json_response(true, $new_flat);
        }
    }

    public function update_flat($data)
    {


        ire_check_nonce($data['nonce'], 'ire_nonce');

        $flat_id = isset($data['flat_id']) ? intval($data['flat_id']) : null;

        if (!$flat_id) {
            ire_send_json_response(false, 'flat_id is required');
            return;
        }

        $required_fields = ['flat_number', 'price', 'use_type'];

        if (isset($data['use_type']) && $data['use_type'] === 'true') {
            $required_fields[] = 'type_id';
        }

        $required_data = ire_check_required_data($data, $required_fields);

        $keys = ['floor_number', 'project_id', 'block_id', 'offer_price', 'conf'];
        $params = ire_validate_and_sanitize_input($data, $keys, false);

        $params =  array_merge($required_data, $params);

        if (!isset($params['block_id'])) {
            $params['block_id'] = null;
        }

        $params['type'] = ire_handle_json_data($data['type']);
        $params['use_type'] = $params['use_type'] === 'true' ? 1 : 0;


        $where = ['id' => $flat_id];
        $this->wpdb->update($this->table_name, $params, $where);


        if ($this->wpdb->last_error) {
            ire_send_json_response(false, 'Database error');
        } else {
            ire_send_json_response(true, 'Flat updated successfully');
        }
    }

    public function delete_flat($data)
    {
        ire_check_nonce($data['nonce'], 'ire_nonce');

        $flat_id = isset($data['flat_id']) ? intval($data['flat_id']) : null;

        if (!$flat_id) {
            ire_send_json_response(false, 'flat_id is required');
            return;
        }

        $delete_result = $this->wpdb->delete($this->table_name, ['id' => $flat_id]);

        if ($delete_result) {
            ire_send_json_response(true, 'Flat deleted successfully');
        } else {
            ire_send_json_response(false, 'Database error: ' . $this->wpdb->last_error);
        }
    }


    private function map_flats($item)
    {

        $item['use_type'] =  $item['use_type'] === '1';

        if ($item['type']) {
            $item['type'] = ire_handle_json_data($item['type']);
        }


        if (is_array($item['type']) && isset($item['type']['image_2d']) && !empty($item['type']['image_2d'])) {
            $item['type']['image_2d'] = array_map('ire_get_image_instance', $item['type']['image_2d']);
        }

        if (is_array($item['type']) && isset($item['type']['image_3d']) && !empty($item['type']['image_3d'])) {
            $item['type']['image_3d'] = array_map('ire_get_image_instance', $item['type']['image_3d']);
        }


        return $item;
    }
}

// Initialize the class
$flats_manager = new IreFlat();

// Action functions
function ire_get_flats()
{
    global $flats_manager;

    // Get the results (ensure this is an array or empty array)
    $results = $flats_manager->get_flats($_POST);

    // Check if $results is an array and has at least 2 elements
    if (is_array($results) && isset($results[0], $results[1])) {
        // If the first element is falsy, return a false response with the second element's value
        if (!$results[0]) {
            ire_send_json_response(false, $results[1]);
        } else {
            ire_send_json_response(true, $results[1]);
        }
    } else {
        // If $results is not an array or doesn't have the expected elements, handle the case
        ire_send_json_response(false, 'No flats found or invalid response format');
    }
}


function ire_create_flat()
{
    global $flats_manager;
    $flats_manager->create_flat($_POST);
}

function ire_update_flat()
{
    global $flats_manager;
    $flats_manager->update_flat($_POST);
}

function ire_delete_flat()
{
    global $flats_manager;
    $flats_manager->delete_flat($_POST);
}

// Add action hooks
add_action('wp_ajax_ire_get_flats', 'ire_get_flats');
add_action('wp_ajax_ire_create_flat', 'ire_create_flat');
add_action('wp_ajax_ire_update_flat', 'ire_update_flat');
add_action('wp_ajax_ire_delete_flat', 'ire_delete_flat');
