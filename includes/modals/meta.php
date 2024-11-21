<?php

class IreMetaProject
{


    protected $wpdb;
    protected $table_name;

    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'ire_project_meta';
    }


    public function get_meta(array $data)
    {
        ire_check_nonce($data['nonce'], 'ire_nonce');
        ire_has_project_id($data);



        $query = $this->wpdb->prepare(
            "SELECT * FROM $this->table_name WHERE project_id = %d",
            $data['project_id']
        );

        $results = $this->wpdb->get_results($query, ARRAY_A);


        if ($this->wpdb->last_error) {
            return [false,  'No meta found.'];
        } else {
            return [true,  $results];
        }
    }


    public function create_or_update_meta($data)
    {
        ire_check_nonce($data['nonce'], 'ire_nonce');
        ire_has_project_id($data);

        // Ensure 'meta_data' is present in the request
        if (!isset($data['meta_data']) || !is_array($data['meta_data'])) {
            ire_send_json_response(false, 'Required fields are missing.');
            return;
        }

        foreach ($data['meta_data'] as $meta) {
            // Validate each key-value pair
            if (empty($meta['key']) || !isset($meta['value'])) {
                ire_send_json_response(false, 'Meta key or value is missing.');
                return;
            }

            $project_id = $data['project_id'];
            $meta_key = sanitize_text_field($meta['key']);
            $meta_value = sanitize_textarea_field($meta['value']);

            // Check if the meta already exists
            $existing_meta = $this->wpdb->get_row($this->wpdb->prepare(
                "SELECT id FROM $this->table_name WHERE project_id = %d AND meta_key = %s",
                $project_id,
                $meta_key
            ));

            if ($existing_meta) {

                // Update the existing meta
                $update_result = $this->wpdb->update(
                    $this->table_name,
                    ['meta_value' => $meta_value],
                    ['id' => $existing_meta->id]
                );


                if ($update_result === false) {
                    ire_send_json_response(false, 'Database error during update');
                    return;
                }
            } else {
                // Insert new meta
                $insert_result = $this->wpdb->insert(
                    $this->table_name,
                    [
                        'project_id' => $project_id,
                        'meta_key' => $meta_key,
                        'meta_value' => $meta_value,
                    ]
                );

                if ($insert_result === false) {
                    ire_send_json_response(false, 'Database error during insert');
                    return;
                }
            }
        }

        ire_send_json_response(true, 'Meta added or updated successfully');
    }
}



// Initialize the class
$ire_meta = new IreMetaProject();

// Action functions
function ire_get_meta()
{
    global $ire_meta;
    $results = $ire_meta->get_meta($_POST);

    if (!$results[0]) {
        ire_send_json_response(false, $results[1]);
    } else {
        ire_send_json_response(true, $results[1]);
    }
}

function create_or_update_meta()
{
    global $ire_meta;
    $ire_meta->create_or_update_meta($_POST);
}



// Add action hooks
add_action('wp_ajax_ire_get_meta', 'ire_get_meta');
add_action('wp_ajax_ire_create_or_update_meta', 'create_or_update_meta');
