<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Irep_Tooltip
 *
 * Manages tooltips for projects in the system. This class handles operations for creating, updating, 
 * deleting, and retrieving tooltips from the database. It includes methods for querying and manipulating
 * tooltip data, including pagination and sorting.
 */
class Irep_Tooltip
{
    // Database connection object
    protected $wpdb;

    // Table name for storing tooltip data
    protected $table_name;

    /**
     * Constructor to initialize the database connection and table name.
     * This method is automatically called when an instance of the class is created.
     */
    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name =  'irep_tooltip';  // Table for storing tooltip data
    }

    /**
     * Retrieves tooltips for a specific project, with support for pagination, sorting, and search filtering.
     *
     * @param array $data The request data, including project ID, pagination settings, search term, and sorting parameters.
     * 
     * @return array A two-element array:
     *               - bool: Success status of the operation.
     *               - array: The tooltip data, total count, current page, and per-page values.
     */
    public function get_tooltip(array $data)
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


        // Verify nonce for security and check if project ID is valid
        irep_check_nonce($data['nonce'], 'irep_nonce');
        irep_has_project_id($data);

        // Sanitize sorting parameters (e.g., for column names like 'id' and 'title')
        $data = irep_sanitize_sorting_parameters($data, ['id', 'title']);


        $query = Irep_DB::table($this->table_name);

        $searchTerm = '%' . $data['search'] . '%';
        $query->where('project_id', '=', $data['project_id']);


        if (!empty($data['search'])) {
            $query->where('flat_number', 'LIKE', $searchTerm)
                ->orWhere('id', 'LIKE', $searchTerm);
        }

        $results = $query->orderBy($data['sort_field'], $data['sort_order'])
            ->paginate($data['page'], $data['per_page']);


        if (!$results) {
            return [false,  'something went wrong!'];
        } else {
            // Map the block data to a more usable format
            if ($results['data']) {
                $results['data'] = array_map([$this, 'map_tooltip'], $results['data']);
            }

            return [true, $results];
        }
    }

    /**
     * Creates a new tooltip for a project.
     *
     * @param array $data The request data, including project ID, title, and tooltip content.
     * 
     * @return void
     */
    public function create_tooltip($data)
    {
        // Verify nonce for security
        irep_check_nonce($data['nonce'], 'irep_nonce');

        if (!ire_fs()->can_use_premium_code() && $data['data']['actionType'] === 'script') {
            irep_upgrade_plan();
            return;
        }

        // Validate and sanitize input data
        $required_fields = ['project_id', 'title'];
        $required_data = irep_validate_and_sanitize_input($data, $required_fields);


        if (!$required_data) {
            irep_send_json_response(false, 'Required fields are missing.');
            return;
        }

        // Merge sanitized input with tooltip data
        $data = array_merge($required_data, ['data' => irep_handle_json_data($data['data'])]);



        $action_id = Irep_DB::table($this->table_name)->create($data);

        if (!$action_id) {
            irep_send_json_response(false, 'Database error');
        } else {
            $created_type =  Irep_DB::table($this->table_name)->find($action_id);
            $transformed = $this->map_tooltip($created_type);

            irep_send_json_response(true, $transformed);
        }
    }

    /**
     * Updates an existing tooltip for a project.
     *
     * @param array $data The request data, including action ID (tooltip ID), title, and updated data.
     * 
     * @return void
     */
    public function update_tooltip($data)
    {

        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'       => isset($data['action']) ? sanitize_key($data['action']) : '',
            'project_id' => isset($data['project_id']) ? absint($data['project_id']) : 0,
            'action_id' => isset($data['action_id']) ? absint($data['action_id']) : 0,
            'title'  => isset($data['title']) ? sanitize_text_field($data['title']) : '',
            'data'     =>  $data['data'],
        ];


        // Verify nonce for security
        irep_check_nonce($data['nonce'], 'irep_nonce');

        // Ensure action ID (tooltip ID) is provided
        $action_id = isset($data['action_id']) ? intval($data['action_id']) : null;
        if (!$action_id) {
            irep_send_json_response(false, 'action_id is required');
            return;
        }

        // Prepare the updated data and sanitize JSON data
        $params = ['title' => $data['title'], 'data' => irep_handle_json_data($data['data'])];


        $updated_flat = Irep_DB::table($this->table_name)->where('id', '=',  $action_id)->update($params);


        if ($updated_flat->last_error) {
            irep_send_json_response(false, 'Database error');
        } else {
            irep_send_json_response(true, 'Flat updated successfully');
        }
    }

    /**
     * Deletes a tooltip from the database.
     *
     * @param array $data The request data, including action ID (tooltip ID).
     * 
     * @return void
     */
    public function delete_tooltip($data)
    {
        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'       => isset($data['action']) ? sanitize_key($data['action']) : '',
            'action_id' => isset($data['action_id']) ? absint($data['action_id']) : 0,
        ];

        // Verify nonce for security
        irep_check_nonce($data['nonce'], 'irep_nonce');

        // Ensure action ID (tooltip ID) is provided
        $action_id = isset($data['action_id']) ? intval($data['action_id']) : null;
        if (!$action_id) {
            irep_send_json_response(false, 'action_id is required');
            return;
        }

        $deleted_action = Irep_DB::table($this->table_name)->where('id', '=',  $action_id)->delete();


        // Return success or error based on the result of the delete operation
        if ($deleted_action) {
            irep_send_json_response(true, 'Action deleted successfully');
        } else {
            irep_send_json_response(false, 'Database error: ' . $this->wpdb->last_error);
        }
    }



    private function map_tooltip($item)
    {

        if (is_object($item)) {
            $item = (array) $item;
        }


        $item['data'] = irep_handle_json_data($item['data']);

        // Handle potential targetBlank field within the data
        if (isset($item['data']['targetBlank'])) {
            $item['data']['targetBlank'] = irep_handle_json_data($item['data']['targetBlank']);
        }

        // Handle potential 'script' field and remove escape characters
        if (isset($item['data']['script'])) {
            $item['data']['script'] = str_replace('\\', '', $item['data']['script']);
        }

        return $item;
    }
}

// Initialize the class to create an instance of Irep_Tooltip
$irep_tooltip = new Irep_Tooltip();

/**
 * Action function to retrieve tooltips via AJAX.
 * This function is hooked to the 'wp_ajax_irep_get_tooltip' action.
 */
function irep_get_tooltip()
{
    global $irep_tooltip;

    // Call the get_tooltip method of the Irep_Tooltip class
    $results = $irep_tooltip->get_tooltip($_POST);

    // Send a JSON response based on the results
    if (!$results[0]) {
        irep_send_json_response(false, $results[1]);
    } else {
        irep_send_json_response(true, $results[1]);
    }
}

/**
 * Action function to create a new tooltip via AJAX.
 * This function is hooked to the 'wp_ajax_irep_create_tooltip' action.
 */
function irep_create_tooltip()
{
    global $irep_tooltip;
    $irep_tooltip->create_tooltip($_POST);
}

/**
 * Action function to update an existing tooltip via AJAX.
 * This function is hooked to the 'wp_ajax_irep_update_tooltip' action.
 */
function irep_update_tooltip()
{
    global $irep_tooltip;
    $irep_tooltip->update_tooltip($_POST);
}

/**
 * Action function to delete a tooltip via AJAX.
 * This function is hooked to the 'wp_ajax_irep_delete_tooltip' action.
 */
function irep_delete_tooltip()
{
    global $irep_tooltip;
    $irep_tooltip->delete_tooltip($_POST);
}

// Add action hooks for AJAX requests related to tooltips
add_action('wp_ajax_irep_get_tooltip', 'irep_get_tooltip');
add_action('wp_ajax_irep_create_tooltip', 'irep_create_tooltip');
add_action('wp_ajax_irep_update_tooltip', 'irep_update_tooltip');
add_action('wp_ajax_irep_delete_tooltip', 'irep_delete_tooltip');
