<?php

if (!defined('ABSPATH')) {
    exit;
}
/**
 * Class Irep_Floor
 *
 * Handles floor-related operations for the project management system.
 * Provides methods to create, update, retrieve, and delete floors from the database.
 *
 * @package Irep_Floor
 */
class Irep_Floor
{

    protected $wpdb;
    protected $table_name;

    /**
     * Irep_Floor constructor.
     *
     * Initializes the global $wpdb object and sets the table name.
     */
    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = 'irep_floors';
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
        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'project_id'   => isset($data['project_id']) ? absint($data['project_id']) : 0,
            'sort_field'   => isset($data['sort_field']) ? sanitize_text_field($data['sort_field']) : '',
            'sort_order'   => isset($data['sort_order']) ? sanitize_text_field($data['sort_order']) : '',
            'page'         => isset($data['page']) ? absint($data['page']) : 1,
            'per_page'     => isset($data['per_page']) ? absint($data['per_page']) : 8,
            'search'       => isset($data['search']) ? sanitize_text_field($data['search']) : '',
            'block'        => isset($data['block']) && $data['block'] !== 'null' ? sanitize_text_field($data['block']) : 'null',
        ];

        // Check nonce for security
        irep_check_nonce($data['nonce'], 'irep_nonce');

        // Ensure the project ID is valid
        irep_has_project_id($data);

        // Sanitize and filter sorting parameters
        $data = irep_sanitize_sorting_parameters($data, ['id', 'floor_number', 'conf', 'block_id']);


        $query = Irep_DB::table($this->table_name);

        $query->where('project_id', '=', $data['project_id']);
        $searchTerm = '%' . $data['search'] . '%';



        if (!empty($data['block']) && $data['block'] != 'null') {
            if ($data['block'] !== 'all') {
                $query->where('block_id', '=', $data['block']);
            }
        } else {
            $query->where('block_id', 'IS', 'NULL');
        }


        if (!empty($data['search'])) {
            $query->where('title', 'LIKE', $searchTerm)
                ->orWhere('id', 'LIKE', $searchTerm)
                ->orWhere('floor_number', 'LIKE', $searchTerm);
        }




        $results = $query->orderBy($data['sort_field'], $data['sort_order'])
            ->paginate($data['page'], $data['per_page']);

        if (!$results) {
            return [false, 'something went wrong!'];
        } else {


            if ($results) {
                $results['data'] = array_map([$this, 'map_floor_data'], $results['data']);
            }

            return [true, $results];
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

        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'       => isset($data['action']) ? sanitize_key($data['action']) : '',
            'title'        => isset($data['title']) ? sanitize_text_field($data['title']) : '',
            'floor_number' => isset($data['floor_number']) ? absint($data['floor_number']) : 0,
            'floor_id'     => isset($data['floor_id']) ? absint($data['floor_id']) : 0,
            'conf'         => isset($data['conf']) ? sanitize_text_field($data['conf']) : '',
            'project_id'   => isset($data['project_id']) ? absint($data['project_id']) : 0,
            'block_id'     => isset($data['block_id']) ? absint($data['block_id']) : 0,
            'floor_image'  => $data['floor_image'],
            'svg'          => isset($data['svg']) ? $data['svg'] : '',
            'polygon_data' => isset($data['polygon_data']) ? irep_handle_json_data($data['polygon_data']) : null
        ];


        // Check nonce for security
        irep_check_nonce($data['nonce'], 'irep_nonce');

        // Ensure required fields are present
        $required_fields = ['floor_number', 'floor_image', 'project_id'];
        $required_data = irep_check_required_data($data, $required_fields);

        // Sanitize and validate non-required fields
        $non_required_fields = ['title', 'conf', 'svg', 'block_id', 'polygon_data', 'svg'];
        $non_required_data = irep_validate_and_sanitize_input($data, $non_required_fields, false);


        // Merge required and non-required data
        $non_required_data['polygon_data'] = $data['polygon_data'] ?? null;
        $non_required_data['svg'] = !empty($data['svg']) ? $data['svg'] : '';
        $data  = array_merge($non_required_data, $required_data);

        // Check if the floor already exists
        $this->check_floor_exists_or_not($data['project_id'], $data['floor_number'], $data['block_id']);


        $floor_id = Irep_DB::table($this->table_name)->create($data);

        // Handle database insert errors
        if (!$floor_id) {
            return irep_send_json_response(false, 'something went wrong!');
        } else {
            $inserted_floor =  Irep_DB::table($this->table_name)->find($floor_id);
            $transformed = $this->map_floor_data($inserted_floor);

            return irep_send_json_response(true, $transformed);
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
        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'       => isset($data['action']) ? sanitize_key($data['action']) : '',
            'title'        => isset($data['title']) ? sanitize_text_field($data['title']) : '',
            'floor_number' => isset($data['floor_number']) ? absint($data['floor_number']) : 0,
            'floor_id'     => isset($data['floor_id']) ? absint($data['floor_id']) : 0,
            'conf'         => isset($data['conf']) ? sanitize_text_field($data['conf']) : '',
            'project_id'   => isset($data['project_id']) ? absint($data['project_id']) : 0,
            'block_id'     => isset($data['block_id']) ? absint($data['block_id']) : 0,
            'floor_image'  => $data['floor_image'] ?? 0,
            'svg'          => $data['svg'],
            'polygon_data' => isset($data['polygon_data']) ? irep_handle_json_data($data['polygon_data']) : '',
        ];


        // Check nonce for security
        irep_check_nonce($data['nonce'], 'irep_nonce');

        // Ensure the floor_id is present
        if (!$data['floor_id']) {
            irep_send_json_response(false, 'floor_id is required');
            return;
        }

        // Prepare the keys to be updated
        $keys = ['floor_number', 'title', 'floor_image', 'polygon_data', 'svg', 'conf', 'block_id'];
        $params = array_filter($data, function ($value, $key) use ($keys) {
            return in_array($key, $keys) && $value;
        }, ARRAY_FILTER_USE_BOTH);



        $params['conf'] = $params['conf'] ?? null;
        $params['block_id'] = $params['block_id'] ?? null;
        $params['polygon_data'] = $params['polygon_data'] ?? null;


        $updated_floor = Irep_DB::table($this->table_name)->where('id', '=',  $data['floor_id'])->update($params);



        // Handle database update errors
        if ($updated_floor->last_error) {
            irep_database_duplicate_error($this->wpdb, 'Floor number already exists for this project.');
        } else {
            irep_send_json_response(true, 'Floor updated successfully');
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
        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'       => isset($data['action']) ? sanitize_key($data['action']) : '',
            'floor_id'      => isset($data['floor_id']) ? absint($data['floor_id']) : 0,
        ];

        // Check nonce for security
        irep_check_nonce($data['nonce'], 'irep_nonce');

        // Ensure the floor_id is provided
        if (!$data['floor_id']) {
            irep_send_json_response(false, 'floor_id is required');
            return;
        }


        $deleted_floor = Irep_DB::table($this->table_name)->where('id', '=',  $data['floor_id'])->delete();

        // Return success or error response
        if (!$deleted_floor->last_error) {
            irep_send_json_response(true, 'Floor deleted successfully');
        } else {
            irep_send_json_response(false, 'Database error: ' . $deleted_floor->last_error);
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
        if (is_object($item)) {
            $item = (array) $item;
        }

        if ($item['polygon_data']) {
            $item['polygon_data'] = irep_handle_json_data($item['polygon_data']);
        }
        $item['floor_image'] = [irep_get_image_instance($item['floor_image'])];
        $item['svg'] = irep_transformSvgString($item['svg']);

        return $item;
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
        $conditions = [];

        $conditions[] = ['project_id', '=', $project_id];
        $conditions[] = ['floor_number', '=', $floor_number];

        if ($block_id !== null) {
            $conditions[] = ['block_id', '=', $block_id];
        } else {
            $conditions[] = ['block_id', 'IS', 'NULL'];
        }


        $query = Irep_DB::table($this->table_name);


        foreach ($conditions as $condition) {
            $query->where($condition[0], $condition[1], $condition[2] ?? null);
        }


        $result = $query->get();


        if (isset($result) && !empty($result)) {
            irep_send_json_response(false, 'Floor number already exists for this project.');
        }
    }
}

// Initialize the class
$irep_floor = new Irep_Floor();

// Action functions
/**
 * Retrieves the floors for the current request and sends the response.
 *
 * This function handles the `wp_ajax_irep_get_floors` AJAX request.
 */
function irep_get_floors()
{
    global $irep_floor;

    $results = $irep_floor->get_floors($_POST);


    if (is_array($results) && isset($results[0], $results[1])) {
        irep_send_json_response(true, $results[1]);
    } else {
        irep_send_json_response(false, 'No floors found or invalid response format');
    }
}

/**
 * Creates a new floor based on the current request.
 *
 * This function handles the `wp_ajax_irep_create_floor` AJAX request.
 */
function irep_create_floor()
{
    global $irep_floor;
    $irep_floor->create_floor($_POST);
}

/**
 * Updates an existing floor based on the current request.
 *
 * This function handles the `wp_ajax_irep_update_floor` AJAX request.
 */
function irep_update_floor()
{
    global $irep_floor;
    $irep_floor->update_floor($_POST);
}

/**
 * Deletes a floor based on the current request.
 *
 * This function handles the `wp_ajax_irep_delete_floor` AJAX request.
 */
function irep_delete_floor()
{
    global $irep_floor;
    $irep_floor->delete_floor($_POST);
}

// Add action hooks
add_action('wp_ajax_irep_get_floors', 'irep_get_floors');
add_action('wp_ajax_irep_create_floor', 'irep_create_floor');
add_action('wp_ajax_irep_update_floor', 'irep_update_floor');
add_action('wp_ajax_irep_delete_floor', 'irep_delete_floor');
