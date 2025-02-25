<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Irep_Block
 *
 * Handles block-related operations in the project management system.
 * Provides methods to create, update, retrieve, and delete blocks from the database.
 *
 * @package Irep_Block
 */
class Irep_Block
{
    protected $wpdb;
    protected $table_name;

    /**
     * Irep_Block constructor.
     *
     * Initializes the global $wpdb object and sets the table name.
     */
    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'irep_blocks';
    }

    /**
     * Retrieves a list of blocks based on the provided parameters.
     *
     * @param array $data An associative array containing the request data, including:
     *                    - nonce (string) The nonce for security validation.
     *                    - project_id (int) The ID of the project to fetch blocks for.
     *                    - search (string, optional) A search term to filter blocks.
     *                    - sort_field (string) The field to sort the results by.
     *                    - sort_order (string) The order of the sorting (ASC or DESC).
     *                    - per_page (int) The number of items per page.
     *                    - offset (int) The offset for pagination.
     * 
     * @return array A two-element array:
     *               - bool: Success status of the operation.
     *               - array: The data, containing the block records, total count, page, and per-page values.
     */
    public function get_block($data)
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

        // Check nonce for security
        irep_check_nonce($data['nonce'], 'irep_nonce');
        irep_has_project_id($data);

        // Sanitize and filter sorting parameters
        $data = irep_sanitize_sorting_parameters($data, ['id', 'title', 'conf']);

        // Base query for fetching blocks
        $query = "SELECT * FROM {$this->table_name} WHERE project_id = %d";
        $params = [$data['project_id']];

        // Apply search filter if provided
        if (!empty($data['search'])) {
            $query .= " AND (title LIKE %s OR id LIKE %s)";
            $searchTerm = '%' . $data['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Prepare and execute the total count query
        $total_query = $this->wpdb->prepare($query, ...$params);
        $total_results =  $this->wpdb->get_results($total_query, ARRAY_A);
        $total_results = count($total_results);

        // Add ordering and pagination to the query
        $query .= " ORDER BY {$data['sort_field']} {$data['sort_order']} LIMIT %d OFFSET %d";
        $params[] = $data['per_page'];
        $params[] = $data['offset'];

        // Prepare and execute the main query
        $query = $this->wpdb->prepare($query, ...$params);
        $results = $this->wpdb->get_results($query, ARRAY_A);

        // Handle errors in fetching results
        if (is_wp_error($results)) {
            return [false,  $results->get_error_message()];
        } else {
            // Map the block data to a more usable format
            if ($results) {
                $results = array_map([$this, 'map_block_data'], $results);
            }

            // Return the results with pagination data
            return [true,  [
                'data' => $results,
                'total' => $total_results,
                'page' => $data['page'],
                'per_page' => $data['per_page']
            ]];
        }
    }

    /**
     * Creates a new block and inserts it into the database.
     *
     * @param array $data An associative array containing the block data, including:
     *                    - nonce (string) The nonce for security validation.
     *                    - title (string) The title of the block.
     *                    - block_image (string) The URL or ID of the block's image.
     *                    - project_id (int) The ID of the associated project.
     *                    - conf (string, optional) Configuration data for the block.
     *                    - polygon_data (string, optional) The polygon data for the block.
     *                    - svg (string, optional) The SVG representation of the block.
     * 
     * @return void
     * 
     * @throws Exception If the block number already exists for the project.
     */
    public function create_block($data)
    {

        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'       => isset($data['action']) ? sanitize_key($data['action']) : '',
            'title'  => isset($data['title']) ? sanitize_text_field($data['title']) : '',
            'conf'  => isset($data['conf']) ? sanitize_text_field($data['conf']) : '',
            'project_id' => isset($data['project_id']) ? absint($data['project_id']) : 0,
            'block_image' => $data['block_image'],
            'svg'  => $data['svg'],
            'polygon_data' => $data['polygon_data'],
        ];

        // Check nonce for security
        irep_check_nonce($data['nonce'], 'irep_nonce');
        irep_has_project_id($data);

        // Ensure required fields are present
        $required_fields = ['title', 'block_image', 'project_id'];
        $required_data = irep_check_required_data($data, $required_fields);

        // Sanitize and validate non-required fields
        $non_required_fields = ['conf', 'polygon_data', 'svg'];
        $non_required_data = irep_validate_and_sanitize_input($data, $non_required_fields, false);

        // Merge required and non-required data
        $non_required_data['polygon_data'] = $data['polygon_data'] ?? null;
        $non_required_data['svg'] = !empty($data['svg']) ? $data['svg'] : '';
        $data  = array_merge($non_required_data, $required_data);


        // Handle polygon data if provided
        if (isset($data['polygon_data'])) {
            $data['polygon_data'] = irep_handle_json_data($data['polygon_data']);
        }

        // Insert the new block data into the database
        $this->wpdb->insert($this->table_name, $data);

        // Handle database insert errors
        if ($this->wpdb->last_error) {
            irep_database_duplicate_error($this->wpdb, 'Block number already exists for this project.');
        } else {
            // Get the inserted block ID and prepare the response
            $new_block_id = $this->wpdb->insert_id;
            $new_block = irep_get($this->table_name, $new_block_id);

            $this->prepare_block_data($new_block);
            irep_send_json_response(true, $new_block);
        }
    }

    /**
     * Updates an existing block with the provided data.
     *
     * @param array $data An associative array containing the updated block data, including:
     *                    - nonce (string) The nonce for security validation.
     *                    - block_id (int) The ID of the block to be updated.
     *                    - title (string) The new title of the block.
     *                    - block_image (string) The new image URL/ID.
     *                    - conf (string, optional) The new configuration data.
     *                    - polygon_data (string, optional) The new polygon data.
     *                    - svg (string, optional) The new SVG representation.
     * 
     * @return void
     * 
     * @throws Exception If the block number already exists for the project.
     */
    public function update_block($data)
    {

        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'       => isset($data['action']) ? sanitize_key($data['action']) : '',
            'block_id'      => isset($data['block_id']) ? absint($data['block_id']) : 0,
            'title'  => isset($data['title']) ? sanitize_text_field($data['title']) : '',
            'conf'  => isset($data['conf']) ? sanitize_text_field($data['conf']) : '',
            'project_id' => isset($data['project_id']) ? absint($data['project_id']) : 0,
            'block_image' => $data['block_image'],
            'svg'  => $data['svg'],
            'polygon_data' => $data['polygon_data'],
        ];


        // Check nonce for security
        irep_check_nonce($data['nonce'], 'irep_nonce');

        // Ensure the block_id is provided
        $block_id = isset($data['block_id']) ? intval($data['block_id']) : null;
        if (!$block_id) {
            irep_send_json_response(false, 'block_id is required');
            return;
        }

        // Prepare the keys to be updated
        $required_fields = ['title', 'block_image'];
        $required_data = irep_check_required_data($data, $required_fields);

        $non_required_fields = ['conf', 'polygon_data', 'svg'];
        $non_required_data = irep_validate_and_sanitize_input($data, $non_required_fields, false);

        // Merge required and non-required data
        $params  = array_merge($non_required_data, $required_data);

        // Handle optional fields
        if (isset($data['svg'])) {
            $params['svg'] = $data['svg'];
        }

        if (empty($params['conf'])) {
            $params['conf'] = null;
        }

        // Handle polygon data and image containment
        $params['polygon_data'] = irep_handle_json_data($data['polygon_data'] ?? '');

        // Update the block in the database
        $where = ['id' => $block_id];
        $this->wpdb->update($this->table_name, $params, $where);

        // Handle database update errors
        if ($this->wpdb->last_error) {
            irep_database_duplicate_error($this->wpdb, 'Block number already exists for this project.');
        } else {
            irep_send_json_response(true, 'Block updated successfully');
        }
    }

    /**
     * Deletes a block from the database.
     *
     * @param array $data An associative array containing:
     *                    - nonce (string) The nonce for security validation.
     *                    - block_id (int) The ID of the block to be deleted.
     * 
     * @return void
     */
    public function delete_block($data)
    {
        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'       => isset($data['action']) ? sanitize_key($data['action']) : '',
            'block_id'      => isset($data['block_id']) ? absint($data['block_id']) : 0,
        ];

        // Check nonce for security
        irep_check_nonce($data['nonce'], 'irep_nonce');

        // Ensure the block_id is provided
        $block_id = isset($data['block_id']) ? intval($data['block_id']) : null;
        if (!$block_id) {
            irep_send_json_response(false, 'block_id is required');
            return;
        }

        // Delete the block from the database
        $delete_result = $this->wpdb->delete($this->table_name, ['id' => $block_id]);

        // Handle delete result
        if ($delete_result) {
            irep_send_json_response(true, 'Block deleted successfully');
        } else {
            irep_send_json_response(false, 'Database error: ' . $this->wpdb->last_error);
        }
    }

    /**
     * Maps the block data to a more usable format.
     *
     * @param array $item The block data to be mapped.
     * 
     * @return array The mapped block data.
     */
    private function map_block_data($item)
    {
        // Process polygon data if available
        if ($item['polygon_data']) {
            $item['polygon_data'] = irep_handle_json_data($item['polygon_data']);
        }

        // Process block image and SVG
        $item['block_image'] = [irep_get_image_instance($item['block_image'])];
        $item['svg'] = irep_transformSvgString($item['svg']);

        return $item;
    }

    /**
     * Prepares the block data for output.
     *
     * @param object $block The block object to be prepared.
     * 
     * @return void
     */
    private function prepare_block_data(&$block)
    {
        // Process polygon data if available
        if (isset($block->polygon_data)) {
            $block->polygon_data = irep_handle_json_data($block->polygon_data);
        }

        // Process SVG data
        $block->svg = irep_transformSvgString($block->svg);

        // Process block image
        $block->block_image = [irep_get_image_instance($block->block_image)];
    }
}

// Initialize the class
$irep_block = new Irep_Block();

// Action functions

/**
 * Retrieves blocks based on the current request and sends the response.
 *
 * Handles the `wp_ajax_irep_get_blocks` AJAX request.
 */
function irep_get_blocks()
{
    global $irep_block;
    $results = $irep_block->get_block($_POST);

    if (!$results[0]) {
        irep_send_json_response(false, $results[1]);
    } else {
        irep_send_json_response(true, $results[1]);
    }
}

/**
 * Creates a new block based on the current request and sends the response.
 *
 * Handles the `wp_ajax_irep_create_block` AJAX request.
 */
function irep_create_block()
{
    global $irep_block;
    $irep_block->create_block($_POST);
}

/**
 * Updates an existing block based on the current request and sends the response.
 *
 * Handles the `wp_ajax_irep_update_block` AJAX request.
 */
function irep_update_block()
{
    global $irep_block;
    $irep_block->update_block($_POST);
}

/**
 * Deletes a block based on the current request and sends the response.
 *
 * Handles the `wp_ajax_irep_delete_block` AJAX request.
 */
function irep_delete_block()
{
    global $irep_block;
    $irep_block->delete_block($_POST);
}

// Add action hooks
add_action('wp_ajax_irep_get_blocks', 'irep_get_blocks');
add_action('wp_ajax_irep_create_block', 'irep_create_block');
add_action('wp_ajax_irep_update_block', 'irep_update_block');
add_action('wp_ajax_irep_delete_block', 'irep_delete_block');
