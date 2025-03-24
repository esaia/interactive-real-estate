<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Irep_Meta_Project
 *
 * Manages the creation, retrieval, and updating of project metadata in the database.
 * This class provides methods to get project metadata and to either create new metadata or update existing metadata.
 */
class Irep_Meta_Project
{
    // Database connection object
    protected $wpdb;

    // Table name for storing project metadata
    protected $table_name;

    /**
     * Constructor to initialize the database connection and table name.
     * This method is called automatically when an instance of the class is created.
     */
    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name =  'irep_project_meta';  // Table for project metadata
    }

    /**
     * Retrieves project metadata from the database based on the provided project ID.
     *
     * @param array $data The request data containing the project ID and nonce for security validation.
     * 
     * @return array A two-element array:
     *               - bool: Success status of the operation.
     *               - array: The metadata results or an error message.
     */
    public function get_meta(array $data)
    {
        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'       => isset($data['action']) ? sanitize_key($data['action']) : '',
            'project_id'   => isset($data['project_id']) ? absint($data['project_id']) : 0,
        ];

        // Verify the nonce for security and check if project ID is valid
        irep_check_nonce($data['nonce'], 'irep_nonce');
        irep_has_project_id($data);

        $query = Irep_DB::table($this->table_name);

        $query->where('project_id', '=', $data['project_id']);

        $results = $query->get();


        // Check if there was a database error
        if (!$results) {
            return [false,  'No meta found.'];  // Return false and error message if no results
        } else {
            return [true,  $results];  // Return true and the results if found
        }
    }

    /**
     * Creates or updates project metadata in the database.
     *
     * @param array $data The request data containing project ID, nonce, and metadata to be created or updated.
     * 
     * @return void
     */
    public function create_or_update_meta($data)
    {
        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'       => isset($data['action']) ? sanitize_key($data['action']) : '',
            'project_id' => isset($data['project_id']) ? absint($data['project_id']) : 0,
            'meta_data' => $data['meta_data']
        ];


        if (!ire_fs()->can_use_premium_code()) {
            // irep_upgrade_plan();
            $filtered_keys = ['tooltip'];

            $data['meta_data'] = array_filter($data['meta_data'], function ($item) use ($filtered_keys) {

                if ($item['key'] === 'currency') {
                    $available_currencies = ['usd'];
                    return in_array($item['value'], $available_currencies);
                };

                return in_array($item['key'], $filtered_keys);
            });
        }



        // Verify the nonce for security and check if project ID is valid
        irep_check_nonce($data['nonce'], 'irep_nonce');
        irep_has_project_id($data);

        // Ensure 'meta_data' is provided and is an array
        if (!isset($data['meta_data']) || !is_array($data['meta_data'])) {
            irep_send_json_response(false, 'Required fields are missing.');
            return;
        }

        // Iterate through each metadata item
        foreach ($data['meta_data'] as $meta) {
            // Validate each meta key-value pair
            if (empty($meta['key']) || !isset($meta['value'])) {
                irep_send_json_response(false, 'Meta key or value is missing.');
                return;
            }

            // Sanitize and prepare the meta data
            $project_id = $data['project_id'];
            $meta_key = sanitize_text_field($meta['key']);
            $meta_value = sanitize_textarea_field($meta['value']);


            $query = Irep_DB::table($this->table_name);


            $existing_meta = $query->where('project_id', '=', $project_id)->where('meta_key', '=', $meta_key)->get();

            $update_query = Irep_DB::table($this->table_name);


            if ($existing_meta) {
                $params =  ['meta_value' => $meta_value];


                $update_result = $update_query->where('id', '=',  $existing_meta[0]->id)->update($params);


                // If the update fails, send an error response
                if ($update_result->last_error) {
                    irep_send_json_response(false, 'Database error during update');
                    return;
                }
            } else {
                $data =  [
                    'project_id' => $project_id,
                    'meta_key' => $meta_key,
                    'meta_value' => $meta_value,
                ];

                $insert_result = Irep_DB::table($this->table_name)->create($data);

                // If the insert fails, send an error response
                if (!$insert_result) {
                    irep_send_json_response(false, 'Database error during insert');
                    return;
                }
            }
        }

        // Send success response once the metadata has been added or updated
        irep_send_json_response(true, 'Meta added or updated successfully');
    }
}

// Initialize the class to create an instance of Irep_Meta_Project
$irep_meta = new Irep_Meta_Project();

/**
 * Action function to retrieve project metadata via AJAX.
 * This function is hooked to the 'wp_ajax_irep_get_meta' action.
 */
function irep_get_meta()
{
    global $irep_meta;

    // Call the get_meta method of the Irep_Meta_Project class
    $results = $irep_meta->get_meta($_POST);

    // Send a JSON response based on the results
    if (!$results[0]) {
        irep_send_json_response(false, $results[1]);
    } else {
        irep_send_json_response(true, $results[1]);
    }
}

/**
 * Action function to create or update project metadata via AJAX.
 * This function is hooked to the 'wp_ajax_irep_create_or_update_meta' action.
 */
function irep_create_or_update_meta()
{
    global $irep_meta;

    // Call the create_or_update_meta method of the Irep_Meta_Project class
    $irep_meta->create_or_update_meta($_POST);
}

// Add AJAX action hooks for retrieving and creating/updating project metadata
add_action('wp_ajax_irep_get_meta', 'irep_get_meta');
add_action('wp_ajax_irep_create_or_update_meta', 'irep_create_or_update_meta');
