<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class IreProject
 * 
 * Handles CRUD operations for the "projects" table in the database.
 * Provides functionality to retrieve, create, update, and delete projects.
 */
class IreProject
{
    /**
     * @var wpdb $wpdb WordPress database object.
     */
    protected $wpdb;

    /**
     * @var string $table_name Name of the projects table in the WordPress database.
     */
    protected $table_name;

    /**
     * IreProject constructor.
     *
     * Initializes the project class with the global $wpdb object to interact with the WordPress database.
     */
    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'ire_projects';  // Set the projects table name with WordPress table prefix.
    }

    /**
     * Retrieve all projects or a specific project by ID.
     * 
     * @param array $data The request data, should include 'nonce' and optionally 'project_id'.
     * 
     * @return array Returns an array where the first element is a boolean indicating success/failure,
     *               and the second element is either the projects data or an error message.
     */
    public function get_projects(array $data)
    {
        // Verify nonce for security to prevent CSRF attacks.
        ire_check_nonce($data['nonce'], 'ire_nonce');

        // Retrieve project ID from request, if available.
        $project_id = isset($data['project_id']) ? intval($data['project_id']) : null;

        if ($project_id) {
            // Retrieve a single project by its ID.
            $result = $this->wpdb->get_row($this->wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $project_id));

            if ($result) {
                // Process project data (e.g., handle images, SVG, and JSON decoding).
                $result->project_image = [ire_get_image_instance($result->project_image)];
                $result->svg = ire_transformSvgString($result->svg);
                $result->polygon_data = json_decode($result->polygon_data);
            }
        } else {
            // Retrieve all projects ordered by ID (descending).
            $result = $this->wpdb->get_results("SELECT * FROM {$this->table_name} ORDER BY id DESC");

            if ($result) {
                // Process each project to decode JSON and format image data.
                $result = array_map(function ($item) {
                    $item->polygon_data = json_decode($item->polygon_data);
                    $item->project_image = [ire_get_image_instance($item->project_image)];
                    $item->svg = ire_transformSvgString($item->svg);

                    return $item;
                }, $result);
            }
        }

        // Check for database errors and return the results or error message.
        if ($this->wpdb->last_error) {
            return [false, 'No projects found.'];
        } else {
            return [true, $result];
        }
    }

    /**
     * Create a new project in the database.
     * 
     * @param array $data The request data containing the project details (e.g., title, image).
     * 
     * @return void Sends a JSON response indicating success or failure.
     */
    public function create_project($data)
    {
        // Verify nonce for security.
        ire_check_nonce($data['nonce'], 'ire_nonce');

        // Sanitize input fields.
        $title = isset($data['title']) ? sanitize_text_field($data['title']) : '';
        $project_image = isset($data['project_image']) ? sanitize_text_field($data['project_image']) : '';
        $slug = sanitize_title($title); // Generate a sanitized slug for the project.

        // Insert the new project into the database.
        $this->wpdb->insert(
            $this->table_name,
            [
                'title' => $title,
                'project_image' => $project_image,
                'svg' => '',
                'slug' => $slug
            ]
        );

        // Return a JSON response based on the success of the database operation.
        if ($this->wpdb->last_error) {
            ire_send_json_response(false, 'Database error');
        } else {
            ire_send_json_response(true, 'Project added');
        }
    }

    /**
     * Update an existing project in the database.
     * 
     * @param array $data The request data containing the project ID and updated details (e.g., title, SVG, image).
     * 
     * @return void Sends a JSON response indicating success or failure.
     */
    public function update_project($data)
    {
        // Verify nonce for security.
        ire_check_nonce($data['nonce'], 'ire_nonce');

        // Retrieve project ID from request.
        $project_id = isset($data['projectId']) ? intval($data['projectId']) : null;

        // Define allowed fields for updating.
        $keys = ['svg', 'title', 'polygon_data', 'project_image'];

        // Filter the request data to only include valid fields.
        $params = array_filter($data, function ($key) use ($keys) {
            return in_array($key, $keys);
        }, ARRAY_FILTER_USE_KEY);

        // Ensure polygon_data is properly encoded as JSON.
        $params['polygon_data'] = json_encode($params['polygon_data'] ?? '');

        // Update the project in the database.
        $where = ['id' => $project_id];
        $this->wpdb->update($this->table_name, $params, $where);

        // Return a JSON response based on the success of the update.
        if ($this->wpdb->last_error) {
            ire_send_json_response(false, 'No projects found.');
        } else {
            ire_send_json_response(true, 'Project updated');
        }
    }

    /**
     * Delete a project from the database.
     * 
     * @param array $data The request data containing the project ID to delete.
     * 
     * @return void Sends a JSON response indicating success or failure.
     */
    public function delete_project($data)
    {
        // Verify nonce for security.
        ire_check_nonce($data['nonce'], 'ire_nonce');

        // Retrieve project ID from request.
        $project_id = isset($data['project_id']) ? intval($data['project_id']) : null;

        // Check if the project ID is provided.
        if (!$project_id) {
            ire_send_json_response(false, 'project_id is required');
            return;
        }

        // Delete the project from the database.
        $delete_result = $this->wpdb->delete($this->table_name, ['id' => $project_id]);

        // Return a JSON response based on the success of the deletion.
        if ($delete_result) {
            ire_send_json_response(true, 'Project deleted successfully');
        } else {
            ire_send_json_response(false, 'Database error: ' . $this->wpdb->last_error);
        }
    }
}

// Initialize the IreProject class.
$project = new IreProject();

/**
 * AJAX handler function to retrieve all projects.
 */
function ire_get_projects()
{
    global $project;
    $results = $project->get_projects($_POST);

    // Send the results or error as a JSON response.
    if (!$results[0]) {
        ire_send_json_response(false, $results[1]);
    } else {
        ire_send_json_response(true, $results[1]);
    }
}

/**
 * AJAX handler function to create a new project.
 */
function ire_create_project()
{
    global $project;
    $project->create_project($_POST);
}

/**
 * AJAX handler function to update an existing project.
 */
function ire_update_project()
{
    global $project;
    $project->update_project($_POST);
}

/**
 * AJAX handler function to delete a project.
 */
function ire_delete_project()
{
    global $project;
    $project->delete_project($_POST);
}

// Register the AJAX actions for WordPress.
add_action('wp_ajax_ire_get_projects', 'ire_get_projects');
add_action('wp_ajax_ire_create_project', 'ire_create_project');
add_action('wp_ajax_ire_update_project', 'ire_update_project');
add_action('wp_ajax_ire_delete_project', 'ire_delete_project');
