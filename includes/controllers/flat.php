<?php

/**
 * Class IreFlat
 *
 * Handles operations related to flats in the project management system.
 * Provides methods to create, update, retrieve, and delete flats from the database.
 */
class IreFlat
{
    private $wpdb;
    private $table_name;

    /**
     * IreFlat constructor.
     *
     * Initializes the global $wpdb object and sets the table name for flats.
     */
    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'ire_flats';
    }

    /**
     * Retrieves flats from the database based on given parameters.
     *
     * @param array $data An associative array containing the request data:
     * 
     * @return array A two-element array:
     *               - bool: Success status of the operation.
     *               - array: The data, containing the flat records, total count, page, and per-page values.
     */
    public function get_flats($data)
    {
        ire_check_nonce($data['nonce'], 'ire_nonce');
        ire_has_project_id($data);

        // Sanitize and filter sorting parameters
        $data = ire_sanitize_sorting_parameters($data, ['id', 'title', 'floor_number', 'price', 'offer_price', 'conf', 'block_id']);

        // Base query to fetch flats from the database
        $query = "SELECT * FROM $this->table_name WHERE project_id = %d";
        $params = [$data['project_id']];

        // Filter by block if provided
        if (!empty($data['block']) && $data['block'] != 'null') {
            if ($data['block'] !== 'all') {
                $query .= " AND block_id = %d";
                $params[] = $data['block'];
            }
        } else {
            $query .= " AND block_id IS NULL"; // Handle null block filtering
        }

        // Filter by floor if provided
        if (!empty($data['floor'])) {
            $query .= " AND floor_number = %d";
            $params[] = $data['floor'];
        }

        // Search filter for flat details like flat number, price, etc.
        if (!empty($data['search'])) {
            $query .= " AND (flat_number LIKE %s OR id LIKE %s OR price LIKE %s OR offer_price LIKE %s)";
            $searchTerm = '%' . $data['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Execute the total count query
        $total_query = $this->wpdb->prepare($query, ...$params);
        $total_results = $this->wpdb->get_results($total_query, ARRAY_A);
        $total_results = count($total_results);

        // Add ordering and pagination to the query
        $query .= " ORDER BY " . esc_sql($data['sort_field']) . " " . esc_sql($data['sort_order']) . " LIMIT %d OFFSET %d";
        $params[] = $data['per_page'];
        $params[] = $data['offset'];

        // Prepare and execute the main query
        $query = $this->wpdb->prepare($query, ...$params);
        $results = $this->wpdb->get_results($query, ARRAY_A);

        if (is_wp_error($results)) {
            return [false, $results->get_error_message()];
        } else if ($results) {
            // Map the flat data to a more usable format
            $results = array_map([$this, 'map_flats'], $results);

            // Return the results with pagination data
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

    /**
     * Creates a new flat and inserts it into the database.
     *
     * @param array $data An associative array containing the flat data:
     * 
     * @return void
     */
    public function create_flat($data)
    {
        ire_check_nonce($data['nonce'], 'ire_nonce');

        // Define required and non-required fields
        $required_fields = ['flat_number', 'price', 'use_type', 'project_id'];
        $non_required_fields = ['floor_number', 'offer_price', 'conf', 'block_id'];

        // Adjust required fields based on use type
        if (isset($data['use_type']) && $data['use_type'] === 'true') {
            $required_fields[] = 'type_id';
        } else {
            $non_required_fields[] = 'type_id';
        }

        // Sanitize and validate required and non-required data
        $required_data = ire_check_required_data($data, $required_fields);
        $non_required_data = ire_validate_and_sanitize_input($data, $non_required_fields, false);

        // Merge the data and prepare it for insertion
        $params = array_merge($required_data, $non_required_data);

        // Handle the type data as JSON
        $params['type'] = ire_handle_json_data($data['type']);
        $params['use_type'] = $params['use_type'] === 'true' ? 1 : 0;

        // Insert the new flat into the database
        $this->wpdb->insert($this->table_name, $params);

        if ($this->wpdb->last_error) {
            ire_send_json_response(false, 'Database error');
        } else {
            // Get the newly inserted flat and prepare the response
            $new_flat_id = $this->wpdb->insert_id;
            $new_flat = ire_get($this->table_name, $new_flat_id);
            ire_send_json_response(true, $new_flat);
        }
    }

    /**
     * Updates an existing flat with new data.
     *
     * @param array $data An associative array containing the updated flat data:
     * 
     * @return void
     */
    public function update_flat($data)
    {
        ire_check_nonce($data['nonce'], 'ire_nonce');

        // Ensure the flat ID is provided
        $flat_id = isset($data['flat_id']) ? intval($data['flat_id']) : null;
        if (!$flat_id) {
            ire_send_json_response(false, 'flat_id is required');
            return;
        }

        // Define required fields
        $required_fields = ['flat_number', 'price', 'use_type'];
        if (isset($data['use_type']) && $data['use_type'] === 'true') {
            $required_fields[] = 'type_id';
        }

        // Sanitize and validate required fields
        $required_data = ire_check_required_data($data, $required_fields);

        // Define and validate optional fields
        $keys = ['floor_number', 'project_id', 'block_id', 'offer_price', 'conf'];
        $params = ire_validate_and_sanitize_input($data, $keys, false);

        // Merge required and optional fields
        $params = array_merge($required_data, $params);

        // Handle block ID and type data
        if (!isset($params['block_id'])) {
            $params['block_id'] = null;
        }
        $params['type'] = ire_handle_json_data($data['type']);
        $params['use_type'] = $params['use_type'] === 'true' ? 1 : 0;

        // Update the flat record in the database
        $where = ['id' => $flat_id];
        $this->wpdb->update($this->table_name, $params, $where);

        if ($this->wpdb->last_error) {
            ire_send_json_response(false, 'Database error');
        } else {
            ire_send_json_response(true, 'Flat updated successfully');
        }
    }

    /**
     * Deletes a flat from the database.
     *
     * @param array $data An associative array containing the flat ID and nonce:
     *                    - nonce (string) The nonce for security validation.
     *                    - flat_id (int) The ID of the flat to delete.
     * 
     * @return void
     */
    public function delete_flat($data)
    {
        ire_check_nonce($data['nonce'], 'ire_nonce');

        // Ensure the flat ID is provided
        $flat_id = isset($data['flat_id']) ? intval($data['flat_id']) : null;
        if (!$flat_id) {
            ire_send_json_response(false, 'flat_id is required');
            return;
        }

        // Delete the flat from the database
        $delete_result = $this->wpdb->delete($this->table_name, ['id' => $flat_id]);

        if ($delete_result) {
            ire_send_json_response(true, 'Flat deleted successfully');
        } else {
            ire_send_json_response(false, 'Database error: ' . $this->wpdb->last_error);
        }
    }

    /**
     * Maps the flat data to a more usable format.
     *
     * @param array $item The flat data to be mapped.
     * 
     * @return array The mapped flat data.
     */
    private function map_flats($item)
    {
        // Handle 'use_type' field as a boolean
        $item['use_type'] =  $item['use_type'] === '1';

        // Process the type data if available
        if ($item['type']) {
            $item['type'] = ire_handle_json_data($item['type']);
        }

        // Process image data for 2D and 3D images, if available
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

/**
 * Handles the AJAX request to retrieve flats.
 */
function ire_get_flats()
{
    global $flats_manager;

    // Get the results and send the response
    $results = $flats_manager->get_flats($_POST);

    if (is_array($results) && isset($results[0], $results[1])) {
        if (!$results[0]) {
            ire_send_json_response(false, $results[1]);
        } else {
            ire_send_json_response(true, $results[1]);
        }
    } else {
        ire_send_json_response(false, 'No flats found or invalid response format');
    }
}

/**
 * Handles the AJAX request to create a flat.
 */
function ire_create_flat()
{
    global $flats_manager;
    $flats_manager->create_flat($_POST);
}

/**
 * Handles the AJAX request to update a flat.
 */
function ire_update_flat()
{
    global $flats_manager;
    $flats_manager->update_flat($_POST);
}

/**
 * Handles the AJAX request to delete a flat.
 */
function ire_delete_flat()
{
    global $flats_manager;
    $flats_manager->delete_flat($_POST);
}

// Add action hooks for AJAX requests
add_action('wp_ajax_ire_get_flats', 'ire_get_flats');
add_action('wp_ajax_ire_create_flat', 'ire_create_flat');
add_action('wp_ajax_ire_update_flat', 'ire_update_flat');
add_action('wp_ajax_ire_delete_flat', 'ire_delete_flat');
