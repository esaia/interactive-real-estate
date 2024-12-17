<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class IreType
 *
 * Handles CRUD operations for property types (e.g., residential, commercial) in the project management system.
 * This includes methods to retrieve, create, update, and delete types from the database.
 */
class IreType
{
    protected $wpdb;
    protected $table_name;

    /**
     * IreType constructor.
     *
     * Initializes the global $wpdb object and sets the table name for property types.
     */
    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'ire_types';
    }

    /**
     * Retrieves property types from the database based on provided filters and pagination.
     *
     * @param array $data The request data:
     * 
     * @return array A two-element array:
     *               - bool: Success status of the operation.
     *               - array: The data, including the property types, total count, page, and per-page values.
     */
    public function get_types($data)
    {
        irep_check_nonce($data['nonce'], 'ire_nonce');
        ire_has_project_id($data);

        // Sanitize and filter sorting parameters
        $data = ire_sanitize_sorting_parameters($data, ['id', 'title', 'area_m2']);

        // Base query to fetch types from the database
        $query = "SELECT * FROM {$this->table_name} WHERE project_id = %d ";
        $params = [$data['project_id']];

        // Apply search filter if provided
        if (!empty($data['search'])) {
            $query .= " AND (title LIKE %s OR id LIKE %s OR teaser LIKE %s OR area_m2 LIKE %s OR rooms_count LIKE %s)";
            $searchTerm = '%' . $data['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Prepare and execute the query to count the total results
        $total_query = $this->wpdb->prepare($query, ...$params);
        $total_results = $this->wpdb->get_results($total_query, ARRAY_A);
        $total_results = count($total_results);

        // Add ordering and pagination to the query
        $query .= " ORDER BY {$data['sort_field']} {$data['sort_order']} LIMIT %d OFFSET %d";
        $params[] = $data['per_page'];
        $params[] = $data['offset'];

        // Prepare and execute the query to fetch the actual results
        $query = $this->wpdb->prepare($query, ...$params);
        $results = $this->wpdb->get_results($query, ARRAY_A);

        if (is_wp_error($results)) {
            return [false, $results->get_error_message()];
        } else if ($results) {
            // Map the results to handle image data
            $results = array_map([$this, 'map_images'], $results);

            // Return the results with pagination information
            return [true, [
                'data' => $results,
                'total' => $total_results,
                'page' => $data['page'],
                'per_page' => $data['per_page']
            ]];
        }
    }

    /**
     * Creates a new property type and inserts it into the database.
     *
     * @param array $data The data for the new property type:
     * 
     * @return void
     */
    public function create_type($data)
    {
        irep_check_nonce($data['nonce'], 'ire_nonce');
        ire_has_project_id($data);

        // Sanitize and validate required data
        $required_data = ire_check_required_data($data, ['title', 'project_id', 'area_m2']);

        // Optional fields
        $non_required_fields = ['teaser', 'rooms_count'];
        $non_required_data = ire_validate_and_sanitize_input($data, $non_required_fields, false);

        // Handle image fields (2D, 3D, and gallery) if provided
        if (!empty($data['image_2d'])) {
            $non_required_data['image_2d'] = ire_handle_json_data($data['image_2d']);
        }

        if (!empty($data['image_3d'])) {
            $non_required_data['image_3d'] = ire_handle_json_data($data['image_3d']);
        }

        if (!empty($data['gallery'])) {
            $non_required_data['gallery'] = ire_handle_json_data($data['gallery']);
        }

        // Merge required and optional data before inserting into the database
        $data = array_merge($required_data, $non_required_data);

        // Insert the new property type into the database
        $this->wpdb->insert($this->table_name, $data);

        if ($this->wpdb->last_error) {
            ire_send_json_response(false, 'Database error');
        } else {
            // Retrieve the newly inserted type and respond with the data
            $new_type_id = $this->wpdb->insert_id;
            $new_type = ire_get($this->table_name, $new_type_id);
            ire_send_json_response(true, $new_type);
        }
    }

    /**
     * Updates an existing property type in the database.
     *
     * @param array $data The data to update:
     * 
     * @return void
     */
    public function update_type($data)
    {
        irep_check_nonce($data['nonce'], 'ire_nonce');

        // Ensure the type ID is provided
        $type_id = isset($data['type_id']) ? intval($data['type_id']) : null;
        if (!$type_id) {
            ire_send_json_response(false, 'type_id is required');
            return;
        }

        // Validate the required fields
        $required_data = ire_check_required_data($data, ['title', 'area_m2']);

        // Optional fields
        $keys = ['teaser', 'rooms_count'];
        $params = ire_validate_and_sanitize_input($data, $keys, false);

        // Merge required and optional fields
        $params = array_merge($required_data, $params);

        // Handle image fields if provided
        if (!empty($data['image_2d'])) {
            $params['image_2d'] = ire_handle_json_data($data['image_2d']);
        }

        if (!empty($data['image_3d'])) {
            $params['image_3d'] = ire_handle_json_data($data['image_3d']);
        }

        if (!empty($data['gallery'])) {
            $params['gallery'] = ire_handle_json_data($data['gallery']);
        }

        // Ensure image fields are null if not provided
        if (!isset($params['image_2d'])) {
            $params['image_2d'] = null;
        }

        if (!isset($params['image_3d'])) {
            $params['image_3d'] = null;
        }

        if (!isset($params['gallery'])) {
            $params['gallery'] = null;
        }

        // Update the property type in the database
        $where = ['id' => $type_id];
        $this->wpdb->update($this->table_name, $params, $where);

        if ($this->wpdb->last_error) {
            ire_send_json_response(false, 'Database error');
        } else {
            ire_send_json_response(true, 'Type updated successfully');
        }
    }

    /**
     * Deletes a property type from the database.
     *
     * @param array $data The data containing the type ID to delete.
     * 
     * @return void
     */
    public function delete_type($data)
    {
        irep_check_nonce($data['nonce'], 'ire_nonce');

        // Ensure the type ID is provided
        $type_id = isset($data['type_id']) ? intval($data['type_id']) : null;
        if (!$type_id) {
            ire_send_json_response(false, 'type_id is required');
            return;
        }

        // Delete the property type from the database
        $delete_result = $this->wpdb->delete($this->table_name, ['id' => $type_id]);

        if ($delete_result) {
            ire_send_json_response(true, 'Type deleted successfully');
        } else {
            ire_send_json_response(false, 'Database error: ' . $this->wpdb->last_error);
        }
    }

    /**
     * Maps the images (2D, 3D, gallery) to their respective instances.
     *
     * @param array $item The property type item.
     * 
     * @return array The modified property type with image instances.
     */
    private function map_images($item)
    {
        // Handle 2D images
        if ($item['image_2d']) {
            $image_2d_ids = ire_handle_json_data($item['image_2d']);
            $item['image_2d'] = array_map('ire_get_image_instance', $image_2d_ids);
        }

        // Handle 3D images
        if ($item['image_3d']) {
            $image_3d_ids = ire_handle_json_data($item['image_3d']);
            $item['image_3d'] = array_map('ire_get_image_instance', $image_3d_ids);
        }

        // Return the modified item
        return $item;
    }
}

// Initialize the class
$type = new IreType();

// Action functions
function ire_get_types()
{
    global $type;

    $results = $type->get_types($_POST);

    if ($results === null) {
        ire_send_json_response(false, 'something went wrong!');
    }

    if (!$results[0]) {
        ire_send_json_response(false, $results[1]);
    } else {
        ire_send_json_response(true, $results[1]);
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
add_action('wp_ajax_ire_get_types', 'ire_get_types');
add_action('wp_ajax_ire_create_type', 'ire_create_type');
add_action('wp_ajax_ire_update_type', 'ire_update_type');
add_action('wp_ajax_ire_delete_type', 'ire_delete_type');
