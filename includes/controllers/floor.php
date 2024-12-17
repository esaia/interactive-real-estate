<?php

if (!defined('ABSPATH')) {
    exit;
}
/**
 * Class IreFloor
 *
 * Handles floor-related operations for the project management system.
 * Provides methods to create, update, retrieve, and delete floors from the database.
 *
 * @package IreFloor
 */
class IreFloor
{

    protected $wpdb;
    protected $table_name;

    /**
     * IreFloor constructor.
     *
     * Initializes the global $wpdb object and sets the table name.
     */
    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'ire_floors';
    }

    /**
     * Retrieves a list of floors based on the provided parameters.
     *
     * @param array $data An associative array containing the request data:
     * 
     * @return array A two-element array:
     *               - bool: Success status of the operation.
     *               - array: The data, containing the floor records, total count, page, and per-page values.
     */
    public function get_floors($data)
    {
        // Check nonce for security
        irep_check_nonce($data['nonce'], 'ire_nonce');

        // Ensure the project ID is valid
        ire_has_project_id($data);

        // Sanitize and filter sorting parameters
        $data = ire_sanitize_sorting_parameters($data, ['id', 'floor_number', 'conf', 'block_id']);

        // Initial query to retrieve floors based on the project ID
        $query = "SELECT * FROM {$this->table_name} WHERE project_id = %d";
        $params = [$data['project_id']];

        // Apply search filters if provided
        if (!empty($data['search'])) {
            $query .= " AND (title LIKE %s OR id LIKE %s OR floor_number LIKE %s)";
            $searchTerm = '%' . $data['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Apply block filter if provided
        if (!empty($data['block']) && $data['block'] != 'null') {
            if ($data['block'] !== 'all') {
                $query .= " AND block_id = %d";
                $params[] = $data['block'];
            }
        } else {
            $query .= " AND block_id IS NULL";
        }

        // Prepare and execute the query to get total results
        $total_query = $this->wpdb->prepare($query, ...$params);
        $total_results = $this->wpdb->get_results($total_query, ARRAY_A);
        $total_results = count($total_results);

        // Apply sorting and pagination
        $query .= " ORDER BY {$data['sort_field']} {$data['sort_order']} LIMIT %d OFFSET %d";
        $params[] = $data['per_page'];
        $params[] = $data['offset'];

        // Prepare and execute the final query
        $query = $this->wpdb->prepare($query, ...$params);
        $results = $this->wpdb->get_results($query, ARRAY_A);

        // Handle errors in fetching the results
        if (is_wp_error($results)) {
            return [false, $results->get_error_message()];
        } else {
            if ($results) {
                // Map the floor data to the correct format
                $results = array_map([$this, 'map_floor_data'], $results);
            }

            // Return the results with total count and pagination info
            return [true, [
                'data' => $results,
                'total' => $total_results,
                'page' => $data['page'],
                'per_page' => $data['per_page']
            ]];
        }
    }

    /**
     * Creates a new floor and inserts it into the database.
     *
     * @param array $data An associative array containing the floor data:
     * 
     * @return void
     * 
     * @throws Exception If the floor number already exists for the project.
     */
    public function create_floor($data)
    {
        // Check nonce for security
        irep_check_nonce($data['nonce'], 'ire_nonce');

        // Ensure required fields are present
        $required_fields = ['floor_number', 'floor_image', 'project_id'];
        $required_data = ire_check_required_data($data, $required_fields);

        // Sanitize and validate non-required fields
        $non_required_fields = ['title', 'conf', 'img_contain', 'svg', 'block_id'];
        $non_required_data = ire_validate_and_sanitize_input($data, $non_required_fields, false);

        // Merge required and non-required data
        $non_required_data['polygon_data'] = $data['polygon_data'] ?? null;
        $non_required_data['svg'] = !empty($data['svg']) ? $data['svg'] : '';
        $data  = array_merge($non_required_data, $required_data);

        // Convert boolean-like fields
        $data['img_contain'] = isset($data['img_contain']) && $data['img_contain'] === 'true' ? 1 : 0;

        // Handle polygon data if available
        if (isset($data['polygon_data'])) {
            $data['polygon_data'] = ire_handle_json_data($data['polygon_data']);
        }

        // Set block_id if available, otherwise null
        $data['block_id'] = $data['block_id'] ?? null;

        // Check if the floor already exists
        $this->check_floor_exists_or_not($data['project_id'], $data['floor_number'], $data['block_id']);

        // Insert the new floor data into the database
        $this->wpdb->insert($this->table_name, $data);

        // Handle database insert errors
        if ($this->wpdb->last_error) {
            ire_database_duplicate_error($this->wpdb, 'Floor number already exists for this project.');
        } else {
            // Get the inserted floor ID and prepare the response
            $new_floor_id = $this->wpdb->insert_id;
            $new_floor = ire_get($this->table_name, $new_floor_id);
            $this->prepare_floor_data($new_floor);
            ire_send_json_response(true, $new_floor);
        }
    }

    /**
     * Updates an existing floor with the provided data.
     *
     * @param array $data An associative array containing the updated floor data:
     * 
     * @return void
     * 
     * @throws Exception If the floor number already exists for the project.
     */
    public function update_floor($data)
    {
        // Check nonce for security
        irep_check_nonce($data['nonce'], 'ire_nonce');

        // Ensure the floor_id is present
        $floor_id = isset($data['floor_id']) ? intval($data['floor_id']) : null;
        if (!$floor_id) {
            ire_send_json_response(false, 'floor_id is required');
            return;
        }

        // Prepare the keys to be updated
        $keys = ['floor_number', 'title', 'conf', 'floor_image', 'polygon_data', 'svg', 'img_contain', 'block_id'];
        $params = array_filter($data, function ($key) use ($keys) {
            return in_array($key, $keys);
        }, ARRAY_FILTER_USE_KEY);

        // Handle optional fields
        if (empty($params['block_id'])) {
            $params['block_id'] = null;
        }
        if (empty($params['conf'])) {
            $params['conf'] = null;
        }

        // Handle polygon data and image containment
        $params['polygon_data'] = ire_handle_json_data($params['polygon_data'] ?? '');
        $params['img_contain'] = isset($params['img_contain']) && $params['img_contain'] === 'true' ? 1 : 0;

        // Update the floor in the database
        $where = ['id' => $floor_id];
        $this->wpdb->update($this->table_name, $params, $where);

        // Handle database update errors
        if ($this->wpdb->last_error) {
            ire_database_duplicate_error($this->wpdb, 'Floor number already exists for this project.');
        } else {
            ire_send_json_response(true, 'Floor updated successfully');
        }
    }

    /**
     * Deletes a floor from the database.
     *
     * @param array $data An associative array containing:
     *                    - nonce (string) The nonce for security validation.
     *                    - floor_id (int) The ID of the floor to be deleted.
     * 
     * @return void
     * 
     * @throws Exception If the floor could not be deleted.
     */
    public function delete_floor($data)
    {
        // Check nonce for security
        irep_check_nonce($data['nonce'], 'ire_nonce');

        // Ensure the floor_id is provided
        $floor_id = isset($data['floor_id']) ? intval($data['floor_id']) : null;
        if (!$floor_id) {
            ire_send_json_response(false, 'floor_id is required');
            return;
        }

        // Delete the floor from the database
        $delete_result = $this->wpdb->delete($this->table_name, ['id' => $floor_id]);

        // Return success or error response
        if ($delete_result) {
            ire_send_json_response(true, 'Floor deleted successfully');
        } else {
            ire_send_json_response(false, 'Database error: ' . $this->wpdb->last_error);
        }
    }

    /**
     * Maps the floor data to a more usable format.
     *
     * This method processes specific fields like polygon_data, floor_image, and svg.
     *
     * @param array $item The floor data to be mapped.
     * 
     * @return array The mapped floor data.
     */
    private function map_floor_data($item)
    {
        if ($item['polygon_data']) {
            $item['polygon_data'] = ire_handle_json_data($item['polygon_data']);
        }
        $item['img_contain'] = $item['img_contain'] == 1;
        $item['floor_image'] = [ire_get_image_instance($item['floor_image'])];
        $item['svg'] = ire_transformSvgString($item['svg']);

        return $item;
    }

    /**
     * Prepares the floor data for output.
     *
     * This method processes fields like polygon_data, floor_image, and svg for rendering.
     *
     * @param object $floor The floor object to be prepared.
     * 
     * @return void
     */
    private function prepare_floor_data(&$floor)
    {
        if (isset($floor->polygon_data)) {
            $floor->polygon_data = ire_handle_json_data($floor->polygon_data);
        }
        $floor->img_contain = $floor->img_contain == 1;
        $floor->floor_image = [ire_get_image_instance($floor->floor_image)];
        $floor->svg = ire_transformSvgString($floor->svg);
    }

    /**
     * Checks if a floor with the given project ID and floor number already exists in the database.
     *
     * @param int $project_id The ID of the project to check.
     * @param int $floor_number The floor number to check.
     * @param int|null $block_id The optional block ID to check.
     * 
     * @return void
     * 
     * @throws Exception If the floor already exists.
     */
    public function check_floor_exists_or_not($project_id, $floor_number, $block_id)
    {
        $params = [];
        $query = "SELECT * FROM {$this->table_name} WHERE project_id = %d AND floor_number = %d";
        $params[] = $project_id;
        $params[] = $floor_number;

        // Add block ID if provided
        if ($block_id !== null) {
            $query .= " AND block_id = %d";
            $params[] = $block_id;
        } else {
            $query .= " AND block_id IS NULL";
        }

        // Prepare and execute the query
        $query = $this->wpdb->prepare($query, ...$params);
        $result = $this->wpdb->get_row($query, ARRAY_A);

        // Check if the floor already exists
        if (isset($result)) {
            ire_send_json_response(false, 'Floor number already exists for this project.');
        }
    }
}

// Initialize the class
$floor = new IreFloor();

// Action functions
/**
 * Retrieves the floors for the current request and sends the response.
 *
 * This function handles the `wp_ajax_ire_get_floors` AJAX request.
 */
function ire_get_floors()
{
    global $floor;

    $results = $floor->get_floors($_POST);

    if (is_array($results) && isset($results[0], $results[1])) {
        if (!$results[0]) {
            ire_send_json_response(false, $results[1]);
        } else {
            ire_send_json_response(true, $results[1]);
        }
    } else {
        ire_send_json_response(false, 'No floors found or invalid response format');
    }
}

/**
 * Creates a new floor based on the current request.
 *
 * This function handles the `wp_ajax_ire_create_floor` AJAX request.
 */
function ire_create_floor()
{
    global $floor;
    $floor->create_floor($_POST);
}

/**
 * Updates an existing floor based on the current request.
 *
 * This function handles the `wp_ajax_ire_update_floor` AJAX request.
 */
function ire_update_floor()
{
    global $floor;
    $floor->update_floor($_POST);
}

/**
 * Deletes a floor based on the current request.
 *
 * This function handles the `wp_ajax_ire_delete_floor` AJAX request.
 */
function ire_delete_floor()
{
    global $floor;
    $floor->delete_floor($_POST);
}

// Add action hooks
add_action('wp_ajax_ire_get_floors', 'ire_get_floors');
add_action('wp_ajax_ire_create_floor', 'ire_create_floor');
add_action('wp_ajax_ire_update_floor', 'ire_update_floor');
add_action('wp_ajax_ire_delete_floor', 'ire_delete_floor');
