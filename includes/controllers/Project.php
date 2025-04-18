<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Irep_Project
 * 
 * Handles CRUD operations for the "projects" table in the database.
 * Provides functionality to retrieve, create, update, and delete projects.
 */
class Irep_Project
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
     * Irep_Project constructor.
     *
     * Initializes the project class with the global $wpdb object to interact with the WordPress database.
     */
    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = 'irep_projects';  // Set the projects table name with WordPress table prefix.
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

        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'       => isset($data['action']) ? sanitize_key($data['action']) : '',
            'project_id'   => isset($data['project_id']) ? absint($data['project_id']) : 0,
        ];

        // Verify nonce for security to prevent CSRF attacks.
        irep_check_nonce($data['nonce'], 'irep_nonce');

        // Retrieve project ID from request, if available.
        $project_id = isset($data['project_id']) ? intval($data['project_id']) : null;

        if ($project_id) {

            $result = Irep_DB::table($this->table_name)->find($project_id);

            if ($result) {
                $result = $this->map_project($result);
            }
        } else {

            $result = Irep_DB::table($this->table_name)->orderBy('id', 'DESC')->get();

            if ($result) {
                // Process each project to decode JSON and format image data.
                $result =  array_map([$this, 'map_project'], $result);
            }
        }

        // Check for database errors and return the results or error message.
        if (!$result) {
            return [false, []];
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

        $data = [
            'nonce'         => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'        => isset($data['action']) ? sanitize_key($data['action']) : '',
            'title'         => isset($data['title']) ? sanitize_text_field($data['title']) : '',
            'project_image' => isset($data['project_image']) ? absint($data['project_image']) : 0,
            'svg'           => isset($data['svg']) ? sanitize_text_field($data['svg']) : '',
        ];

        $this->canUserAddProject($data);

        // Verify nonce for security.
        irep_check_nonce($data['nonce'], 'irep_nonce');

        // Sanitize input fields.
        $title = isset($data['title']) ? sanitize_text_field($data['title']) : '';
        $project_image = isset($data['project_image']) ? sanitize_text_field($data['project_image']) : '';
        $slug = sanitize_title($title); // Generate a sanitized slug for the project.

        $data = [
            'title' => $title,
            'project_image' => $project_image,
            'svg' => '',
            'slug' => $slug,
            'polygon_data' => '{}',
        ];

        $project_id = Irep_DB::table($this->table_name)->create($data);


        // Return a JSON response based on the success of the database operation.
        if (!$project_id) {
            irep_send_json_response(false, 'Database error');
        } else {
            irep_send_json_response(true,  ['msg' => 'Project added', 'project_id' => $project_id]);
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

        $data = [
            'nonce'           => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'          => isset($data['action']) ? sanitize_key($data['action']) : '',
            'title'           => isset($data['title']) ? sanitize_text_field($data['title']) : '',
            'projectId'       => isset($data['projectId']) ? absint($data['projectId']) : 0,
            'slug'            => isset($data['slug']) ? sanitize_text_field($data['slug']) : '',
            'project_image'   => isset($data['project_image']) ? absint($data['project_image']) : 0,
            'svg'             => $data['svg'],
            'polygon_data'    => $data['polygon_data']
        ];

        $data['svg'] = isset($_POST['svg']) ? base64_decode($_POST['svg']) : '';


        // Verify nonce for security.
        irep_check_nonce($data['nonce'], 'irep_nonce');

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


        $updated_project = Irep_DB::table($this->table_name)->where('id', '=', $project_id)->update($params);


        // Return a JSON response based on the success of the update.
        if ($updated_project->last_error) {
            irep_send_json_response(false, 'project not updated.');
        } else {
            irep_send_json_response(true, 'Project updated');
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
        irep_check_nonce($data['nonce'], 'irep_nonce');

        // Retrieve project ID from request.
        $project_id = isset($data['project_id']) ? intval($data['project_id']) : null;

        // Check if the project ID is provided.
        if (!$project_id) {
            irep_send_json_response(false, 'project_id is required');
            return;
        }

        $deleted_project = Irep_DB::table($this->table_name)->where('id', '=',  $project_id)->delete();


        // Return a JSON response based on the success of the deletion.
        if ($deleted_project) {
            irep_send_json_response(true, 'Project deleted successfully');
        } else {
            irep_send_json_response(false, 'Database error');
        }
    }

    public function map_project($item)
    {
        if (is_object($item)) {
            $item = (array) $item;
        }

        $item['project_image'] = [irep_get_image_instance($item['project_image'])];
        $item['svg'] = irep_transformSvgString($item['svg']);
        $item['polygon_data'] = json_decode($item['polygon_data']);

        return $item;
    }

    public function canUserAddProject($data)
    {
        $projects = $this->get_projects($data)[1];
        $check = !ire_fs()->can_use_premium_code() && count($projects) >= 1;

        if ($check) {
            irep_upgrade_plan();
        }
    }
}

// Initialize the Irep_Project class.
$irep_project = new Irep_Project();

/**
 * AJAX handler function to retrieve all projects.
 */
function irep_get_projects()
{
    global $irep_project;
    $results = $irep_project->get_projects($_POST);


    // Send the results or error as a JSON response.
    if (!$results[0]) {
        irep_send_json_response(false, $results[1]);
    } else {
        irep_send_json_response(true, $results[1]);
    }
}

/**
 * AJAX handler function to create a new project.
 */
function irep_create_project()
{
    global $irep_project;
    $irep_project->create_project($_POST);
}

/**
 * AJAX handler function to update an existing project.
 */
function irep_update_project()
{
    global $irep_project;
    $irep_project->update_project($_POST);
}

/**
 * AJAX handler function to delete a project.
 */
function irep_delete_project()
{
    global $irep_project;
    $irep_project->delete_project($_POST);
}

// Register the AJAX actions for WordPress.
add_action('wp_ajax_irep_get_projects', 'irep_get_projects');
add_action('wp_ajax_irep_create_project', 'irep_create_project');
add_action('wp_ajax_irep_update_project', 'irep_update_project');
add_action('wp_ajax_irep_delete_project', 'irep_delete_project');
