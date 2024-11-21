<?php

/**
 * Class IreTooltip
 *
 * Manages tooltips for projects in the system. This class handles operations for creating, updating, 
 * deleting, and retrieving tooltips from the database. It includes methods for querying and manipulating
 * tooltip data, including pagination and sorting.
 */
class IreTooltip
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
        $this->table_name = $wpdb->prefix . 'ire_tooltip';  // Table for storing tooltip data
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
        // Verify nonce for security and check if project ID is valid
        ire_check_nonce($data['nonce'], 'ire_nonce');
        ire_has_project_id($data);

        // Sanitize sorting parameters (e.g., for column names like 'id' and 'title')
        $data = ire_sanitize_sorting_parameters($data, ['id', 'title']);
        $offset = ($data['page'] - 1) * $data['per_page'];  // Calculate offset for pagination

        // Initial query to get tooltips for the given project ID
        $query = "SELECT * FROM {$this->table_name} WHERE project_id = %d ";
        $params = [$data['project_id']];

        // If a search term is provided, filter results by title or ID
        if (!empty($data['search'])) {
            $query .= " AND (title LIKE %s OR id LIKE %s)";
            $searchTerm = '%' . $data['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Prepare query to get the total number of results
        $total_query = $this->wpdb->prepare($query, ...$params);
        $total_results = $this->wpdb->get_results($total_query, ARRAY_A);
        $total_results = count($total_results);  // Count the total number of results

        // Add sorting and pagination to the query
        $query .= " ORDER BY {$data['sort_field']} {$data['sort_order']} LIMIT %d OFFSET %d";
        $params[] = $data['per_page'];  // Add per-page value
        $params[] = $offset;            // Add offset for pagination

        // Prepare and execute the final query
        $query = $this->wpdb->prepare($query, ...$params);
        $results = $this->wpdb->get_results($query, ARRAY_A);

        // Process each result to handle JSON-encoded data fields
        $results = array_map(
            function ($result) {
                $result['data'] = ire_handle_json_data($result['data']);

                // Handle potential targetBlank field within the data
                if (isset($result['data']['targetBlank'])) {
                    $result['data']['targetBlank'] = ire_handle_json_data($result['data']['targetBlank']);
                }

                // Handle potential 'script' field and remove escape characters
                if (isset($result['data']['script'])) {
                    $result['data']['script'] = str_replace('\\', '', $result['data']['script']);
                }

                return $result;
            },
            $results
        );

        // Return the results along with pagination details
        if ($this->wpdb->last_error) {
            return [false,  'No tooltip found.'];  // Return error if there was an issue with the query
        } else {
            return [true, [
                'data' => $results,
                'total' => $total_results,
                'page' => $data['page'],
                'per_page' => $data['per_page']
            ]];
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
        ire_check_nonce($data['nonce'], 'ire_nonce');

        // Validate and sanitize input data
        $required_fields = ['project_id', 'title'];
        $required_data = ire_validate_and_sanitize_input($data, $required_fields);

        if (!$required_data) {
            ire_send_json_response(false, 'Required fields are missing.');
            return;
        }

        // Merge sanitized input with tooltip data
        $data = array_merge($required_data, ['data' => ire_handle_json_data($data['data'])]);

        // Insert the new tooltip into the database
        $this->wpdb->insert($this->table_name, $data);

        if ($this->wpdb->last_error) {
            ire_send_json_response(false, 'Database error');  // Send error if database operation fails
        } else {
            // Fetch the newly inserted tooltip data
            $new_tooltip_id = $this->wpdb->insert_id;
            $new_tooltip = ire_get($this->table_name, $new_tooltip_id);

            // Handle JSON data within the newly fetched tooltip
            if (isset($new_tooltip->data)) {
                $new_tooltip->data = ire_handle_json_data($new_tooltip->data);
            }

            // Send success response with the new tooltip data
            ire_send_json_response(true, $new_tooltip);
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
        // Verify nonce for security
        ire_check_nonce($data['nonce'], 'ire_nonce');

        // Ensure action ID (tooltip ID) is provided
        $action_id = isset($data['action_id']) ? intval($data['action_id']) : null;
        if (!$action_id) {
            ire_send_json_response(false, 'action_id is required');
            return;
        }

        // Prepare the updated data and sanitize JSON data
        $params = ['title' => $data['title'], 'data' => ire_handle_json_data($data['data'])];

        // Specify the tooltip ID to update
        $where = ['id' => $action_id];
        $this->wpdb->update($this->table_name, $params, $where);

        if ($this->wpdb->last_error) {
            ire_send_json_response(false, 'Database error');  // Send error if update fails
        } else {
            ire_send_json_response(true, 'Tooltip updated successfully');  // Send success response
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
        // Verify nonce for security
        ire_check_nonce($data['nonce'], 'ire_nonce');

        // Ensure action ID (tooltip ID) is provided
        $action_id = isset($data['action_id']) ? intval($data['action_id']) : null;
        if (!$action_id) {
            ire_send_json_response(false, 'action_id is required');
            return;
        }

        // Perform the delete operation
        $delete_result = $this->wpdb->delete($this->table_name, ['id' => $action_id]);

        // Return success or error based on the result of the delete operation
        if ($delete_result) {
            ire_send_json_response(true, 'Action deleted successfully');
        } else {
            ire_send_json_response(false, 'Database error: ' . $this->wpdb->last_error);
        }
    }
}

// Initialize the class to create an instance of IreTooltip
$tooltip = new IreTooltip();

/**
 * Action function to retrieve tooltips via AJAX.
 * This function is hooked to the 'wp_ajax_ire_get_tooltip' action.
 */
function ire_get_tooltip()
{
    global $tooltip;

    // Call the get_tooltip method of the IreTooltip class
    $results = $tooltip->get_tooltip($_POST);

    // Send a JSON response based on the results
    if (!$results[0]) {
        ire_send_json_response(false, $results[1]);
    } else {
        ire_send_json_response(true, $results[1]);
    }
}

/**
 * Action function to create a new tooltip via AJAX.
 * This function is hooked to the 'wp_ajax_ire_create_tooltip' action.
 */
function ire_create_tooltip()
{
    global $tooltip;
    $tooltip->create_tooltip($_POST);
}

/**
 * Action function to update an existing tooltip via AJAX.
 * This function is hooked to the 'wp_ajax_ire_update_tooltip' action.
 */
function ire_update_tooltip()
{
    global $tooltip;
    $tooltip->update_tooltip($_POST);
}

/**
 * Action function to delete a tooltip via AJAX.
 * This function is hooked to the 'wp_ajax_ire_delete_tooltip' action.
 */
function ire_delete_tooltip()
{
    global $tooltip;
    $tooltip->delete_tooltip($_POST);
}

// Add action hooks for AJAX requests related to tooltips
add_action('wp_ajax_ire_get_tooltip', 'ire_get_tooltip');
add_action('wp_ajax_ire_create_tooltip', 'ire_create_tooltip');
add_action('wp_ajax_ire_update_tooltip', 'ire_update_tooltip');
add_action('wp_ajax_ire_delete_tooltip', 'ire_delete_tooltip');
