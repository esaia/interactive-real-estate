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
        $this->table_name = 'irep_blocks';
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


        $query = Irep_DB::table($this->table_name);
        $query->where('project_id', '=', $data['project_id']);

        $searchTerm = '%' . $data['search'] . '%';

        if (!empty($data['search'])) {
            $query->where('title', 'LIKE', $searchTerm)
                ->orWhere('id', 'LIKE', $searchTerm);
        }


        $results = $query->orderBy($data['sort_field'], $data['sort_order'])
            ->paginate($data['page'], $data['per_page']);

        if (!$results) {
            return [false,  'something went wrong!'];
        } else {

            // Map the block data to a more usable format
            if ($results['data']) {
                $results['data'] = array_map([$this, 'map_block_data'], $results['data']);
            }

            return [true, $results];
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
            'title'        => isset($data['title']) ? sanitize_text_field($data['title']) : '',
            'conf'         => isset($data['conf']) ? sanitize_text_field($data['conf']) : '',
            'project_id'   => isset($data['project_id']) ? absint($data['project_id']) : 0,
            'block_image'  => $data['block_image'],
            'svg'          => $data['svg'],
            'polygon_data' => isset($data['polygon_data']) ? irep_handle_json_data($data['polygon_data']) : null
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


        $block_id = Irep_DB::table($this->table_name)->create($data);

        if (!$block_id) {
            return irep_send_json_response(false, 'something went wrong!');
        } else {
            $created_block =  Irep_DB::table($this->table_name)->find($block_id);
            $transformed = $this->map_block_data($created_block);

            return irep_send_json_response(true, $transformed);
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
            'block_id'     => isset($data['block_id']) ? absint($data['block_id']) : 0,
            'title'        => isset($data['title']) ? sanitize_text_field($data['title']) : '',
            'conf'         => isset($data['conf']) ? sanitize_text_field($data['conf']) : '',
            'project_id'   => isset($data['project_id']) ? absint($data['project_id']) : 0,
            'block_image'  => $data['block_image'],
            'svg'          => $data['svg'],
            'polygon_data' => isset($data['polygon_data']) ? irep_handle_json_data($data['polygon_data']) : null
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
        $keys = ['title', 'block_image', 'polygon_data', 'svg', 'conf'];
        $params = array_filter($data, function ($value, $key) use ($keys) {
            return in_array($key, $keys) && $value;
        }, ARRAY_FILTER_USE_BOTH);


        $params['conf'] = $params['conf'] ?? null;
        $params['polygon_data'] = $params['polygon_data'] ?? null;


        $updated_block = Irep_DB::table($this->table_name)->where('id', '=',  $block_id)->update($params);

        // Handle database update errors
        if ($updated_block->last_error) {
            irep_database_duplicate_error($this->wpdb, 'Something went wrong!');
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

        $deleted_block = Irep_DB::table($this->table_name)->where('id', '=',  $block_id)->delete();

        // Handle delete result
        if ($deleted_block) {
            irep_send_json_response(true, 'Block deleted successfully');
        } else {
            irep_send_json_response(false, 'Database error: ' . $deleted_block->last_error);
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
        if (is_object($item)) {
            $item = (array) $item;
        }


        // Process polygon data if available
        if ($item['polygon_data']) {
            $item['polygon_data'] = irep_handle_json_data($item['polygon_data']);
        }

        // Process block image and SVG
        $item['block_image'] = [irep_get_image_instance($item['block_image'])];
        $item['svg'] = irep_transformSvgString($item['svg']);

        return $item;
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
