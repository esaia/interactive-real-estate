<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Irep_Type
 *
 * Handles CRUD operations for property types (e.g., residential, commercial) in the project management system.
 * This includes methods to retrieve, create, update, and delete types from the database.
 */
class Irep_Type
{
    protected $wpdb;
    protected $table_name;

    /**
     * Irep_Type constructor.
     *
     * Initializes the global $wpdb object and sets the table name for property types.
     */
    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'irep_types';
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
        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'project_id'   => isset($data['project_id']) ? absint($data['project_id']) : 0,
            'sort_field'   => isset($data['sort_field']) ? sanitize_text_field($data['sort_field']) : '',
            'sort_order'   => isset($data['sort_order']) ? sanitize_text_field($data['sort_order']) : '',
            'page'         => isset($data['page']) ? absint($data['page']) : 1,
            'per_page'     => isset($data['per_page']) ? absint($data['per_page']) : 8,
            'search'       => isset($data['search']) ? sanitize_text_field($data['search']) : '',
        ];


        irep_check_nonce($data['nonce'], 'irep_nonce');
        irep_has_project_id($data);

        // Sanitize and filter sorting parameters
        $data = irep_sanitize_sorting_parameters($data, ['id', 'title', 'area_m2']);

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

        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'       => isset($data['action']) ? sanitize_key($data['action']) : '',
            'type_id'      => isset($data['type_id']) ? absint($data['type_id']) : 0,
            'title'  => isset($data['title']) ? sanitize_text_field($data['title']) : '',
            'teaser'  => isset($data['teaser']) ? sanitize_text_field($data['teaser']) : '',
            'area_m2' => isset($data['area_m2']) ? absint($data['area_m2']) : 0,
            'rooms_count' => isset($data['rooms_count']) ? absint($data['rooms_count']) : 0,
            'project_id' => isset($data['project_id']) ? absint($data['project_id']) : 0,
            'image_2d' => $data['image_2d'],
            'image_3d' => $data['image_3d'],
        ];


        irep_check_nonce($data['nonce'], 'irep_nonce');
        irep_has_project_id($data);

        // Sanitize and validate required data
        $required_data = irep_check_required_data($data, ['title', 'project_id', 'area_m2']);

        // Optional fields
        $non_required_fields = ['teaser', 'rooms_count'];
        $non_required_data = irep_validate_and_sanitize_input($data, $non_required_fields, false);

        // Handle image fields (2D, 3D, and gallery) if provided
        if (!empty($data['image_2d'])) {
            $non_required_data['image_2d'] = irep_handle_json_data($data['image_2d']);
        }

        if (!empty($data['image_3d'])) {
            $non_required_data['image_3d'] = irep_handle_json_data($data['image_3d']);
        }

        if (!empty($data['gallery'])) {
            $non_required_data['gallery'] = irep_handle_json_data($data['gallery']);
        }

        // Merge required and optional data before inserting into the database
        $data = array_merge($required_data, $non_required_data);

        // Insert the new property type into the database
        $this->wpdb->insert($this->table_name, $data);

        if ($this->wpdb->last_error) {
            irep_send_json_response(false, 'Database error');
        } else {
            // Retrieve the newly inserted type and respond with the data
            $new_type_id = $this->wpdb->insert_id;
            $new_type = irep_get($this->table_name, $new_type_id);
            irep_send_json_response(true, $new_type);
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

        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'       => isset($data['action']) ? sanitize_key($data['action']) : '',
            'type_id'      => isset($data['type_id']) ? absint($data['type_id']) : 0,
            'title'  => isset($data['title']) ? sanitize_text_field($data['title']) : '',
            'teaser'  => isset($data['teaser']) ? sanitize_text_field($data['teaser']) : '',
            'area_m2' => isset($data['area_m2']) ? absint($data['area_m2']) : 0,
            'rooms_count' => isset($data['rooms_count']) ? absint($data['rooms_count']) : 0,
            'project_id' => isset($data['project_id']) ? absint($data['project_id']) : 0,
            'image_2d' => $data['image_2d'],
            'image_3d' => $data['image_3d'],
        ];

        irep_check_nonce($data['nonce'], 'irep_nonce');

        // Ensure the type ID is provided
        $type_id = isset($data['type_id']) ? intval($data['type_id']) : null;
        if (!$type_id) {
            irep_send_json_response(false, 'type_id is required');
            return;
        }

        // Validate the required fields
        $required_data = irep_check_required_data($data, ['title', 'area_m2']);

        // Optional fields
        $keys = ['teaser', 'rooms_count'];
        $params = irep_validate_and_sanitize_input($data, $keys, false);

        // Merge required and optional fields
        $params = array_merge($required_data, $params);

        // Handle image fields if provided
        if (!empty($data['image_2d'])) {
            $params['image_2d'] = irep_handle_json_data($data['image_2d']);
        }

        if (!empty($data['image_3d'])) {
            $params['image_3d'] = irep_handle_json_data($data['image_3d']);
        }

        if (!empty($data['gallery'])) {
            $params['gallery'] = irep_handle_json_data($data['gallery']);
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
            irep_send_json_response(false, 'Database error');
        } else {
            irep_send_json_response(true, 'Type updated successfully');
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
        irep_check_nonce($data['nonce'], 'irep_nonce');

        // Ensure the type ID is provided
        $type_id = isset($data['type_id']) ? intval($data['type_id']) : null;
        if (!$type_id) {
            irep_send_json_response(false, 'type_id is required');
            return;
        }

        // Delete the property type from the database
        $delete_result = $this->wpdb->delete($this->table_name, ['id' => $type_id]);

        if ($delete_result) {
            irep_send_json_response(true, 'Type deleted successfully');
        } else {
            irep_send_json_response(false, 'Database error: ' . $this->wpdb->last_error);
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
            $image_2d_ids = irep_handle_json_data($item['image_2d']);
            $item['image_2d'] = array_map('irep_get_image_instance', $image_2d_ids);
        }

        // Handle 3D images
        if ($item['image_3d']) {
            $image_3d_ids = irep_handle_json_data($item['image_3d']);
            $item['image_3d'] = array_map('irep_get_image_instance', $image_3d_ids);
        }

        // Return the modified item
        return $item;
    }
}

// Initialize the class
$irep_type = new Irep_Type();

// Action functions
function irep_get_types()
{
    global $irep_type;

    $results = $irep_type->get_types($_POST);

    if ($results === null) {
        irep_send_json_response(false, 'something went wrong!');
    }

    if (!$results[0]) {
        irep_send_json_response(false, $results[1]);
    } else {
        irep_send_json_response(true, $results[1]);
    }
}

function irep_create_type()
{
    global $irep_type;
    $irep_type->create_type($_POST);
}

function irep_update_type()
{
    global $irep_type;
    $irep_type->update_type($_POST);
}

function irep_delete_type()
{
    global $irep_type;
    $irep_type->delete_type($_POST);
}

// Add action hooks
add_action('wp_ajax_irep_get_types', 'irep_get_types');
add_action('wp_ajax_irep_create_type', 'irep_create_type');
add_action('wp_ajax_irep_update_type', 'irep_update_type');
add_action('wp_ajax_irep_delete_type', 'irep_delete_type');
