<?php

/**
 * Class IreMetaProject
 *
 * Manages the creation, retrieval, and updating of project metadata in the database.
 * This class provides methods to get project metadata and to either create new metadata or update existing metadata.
 */
class IreMetaProject
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
        $this->table_name = $wpdb->prefix . 'ire_project_meta';  // Table for project metadata
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
        // Verify the nonce for security and check if project ID is valid
        ire_check_nonce($data['nonce'], 'ire_nonce');
        ire_has_project_id($data);

        // Prepare SQL query to fetch metadata for the given project ID
        $query = $this->wpdb->prepare(
            "SELECT * FROM $this->table_name WHERE project_id = %d",
            $data['project_id']
        );

        // Execute the query and retrieve results
        $results = $this->wpdb->get_results($query, ARRAY_A);

        // Check if there was a database error
        if ($this->wpdb->last_error) {
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
        // Verify the nonce for security and check if project ID is valid
        ire_check_nonce($data['nonce'], 'ire_nonce');
        ire_has_project_id($data);

        // Ensure 'meta_data' is provided and is an array
        if (!isset($data['meta_data']) || !is_array($data['meta_data'])) {
            ire_send_json_response(false, 'Required fields are missing.');
            return;
        }

        // Iterate through each metadata item
        foreach ($data['meta_data'] as $meta) {
            // Validate each meta key-value pair
            if (empty($meta['key']) || !isset($meta['value'])) {
                ire_send_json_response(false, 'Meta key or value is missing.');
                return;
            }

            // Sanitize and prepare the meta data
            $project_id = $data['project_id'];
            $meta_key = sanitize_text_field($meta['key']);
            $meta_value = sanitize_textarea_field($meta['value']);

            // Check if the meta already exists for the given project ID and key
            $existing_meta = $this->wpdb->get_row($this->wpdb->prepare(
                "SELECT id FROM $this->table_name WHERE project_id = %d AND meta_key = %s",
                $project_id,
                $meta_key
            ));

            if ($existing_meta) {
                // If the meta exists, update the meta value
                $update_result = $this->wpdb->update(
                    $this->table_name,
                    ['meta_value' => $meta_value],  // Update with new value
                    ['id' => $existing_meta->id]    // Specify the meta ID to update
                );

                // If the update fails, send an error response
                if ($update_result === false) {
                    ire_send_json_response(false, 'Database error during update');
                    return;
                }
            } else {
                // If the meta does not exist, insert a new record
                $insert_result = $this->wpdb->insert(
                    $this->table_name,
                    [
                        'project_id' => $project_id,
                        'meta_key' => $meta_key,
                        'meta_value' => $meta_value,
                    ]
                );

                // If the insert fails, send an error response
                if ($insert_result === false) {
                    ire_send_json_response(false, 'Database error during insert');
                    return;
                }
            }
        }

        // Send success response once the metadata has been added or updated
        ire_send_json_response(true, 'Meta added or updated successfully');
    }
}

// Initialize the class to create an instance of IreMetaProject
$ire_meta = new IreMetaProject();

/**
 * Action function to retrieve project metadata via AJAX.
 * This function is hooked to the 'wp_ajax_ire_get_meta' action.
 */
function ire_get_meta()
{
    global $ire_meta;

    // Call the get_meta method of the IreMetaProject class
    $results = $ire_meta->get_meta($_POST);

    // Send a JSON response based on the results
    if (!$results[0]) {
        ire_send_json_response(false, $results[1]);
    } else {
        ire_send_json_response(true, $results[1]);
    }
}

/**
 * Action function to create or update project metadata via AJAX.
 * This function is hooked to the 'wp_ajax_ire_create_or_update_meta' action.
 */
function create_or_update_meta()
{
    global $ire_meta;

    // Call the create_or_update_meta method of the IreMetaProject class
    $ire_meta->create_or_update_meta($_POST);
}

// Add AJAX action hooks for retrieving and creating/updating project metadata
add_action('wp_ajax_ire_get_meta', 'ire_get_meta');
add_action('wp_ajax_ire_create_or_update_meta', 'create_or_update_meta');
