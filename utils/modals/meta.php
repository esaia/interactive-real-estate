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
        check_nonce($data['nonce'], 'ire_nonce');
        has_project_id($data);


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
        check_nonce($data['nonce'], 'ire_nonce');
        has_project_id($data);

        $required_fields = ['project_id', 'meta_key', 'meta_value'];
        $data = validate_and_sanitize_input($data, $required_fields);

        if (!$data) {
            send_json_response(false, 'Required fields are missing.');
            return;
        }

        // Check if the meta already exists
        $existing_meta = $this->wpdb->get_row($this->wpdb->prepare(
            "SELECT id FROM $this->table_name WHERE project_id = %d AND meta_key = %s",
            $data['project_id'],
            $data['meta_key']
        ));

        if ($existing_meta) {
            // Update the existing meta
            $update_result = $this->wpdb->update(
                $this->table_name,
                ['meta_value' => $data['meta_value']],
                ['id' => $existing_meta->id]
            );

            if ($update_result === false) {
                send_json_response(false, 'Database error');
                return;
            }
        } else {
            // Insert new meta
            $insert_result = $this->wpdb->insert(
                $this->table_name,
                [
                    'project_id' => $data['project_id'],
                    'meta_key' => $data['meta_key'],
                    'meta_value' => $data['meta_value'],
                ]
            );

            if ($insert_result === false) {
                send_json_response(false, 'Database error');
                return;
            }
        }

        send_json_response(true, 'Meta added or updated successfully');
    }
}



// Initialize the class
$meta = new IreMetaProject();

// Action functions
function ire_get_meta()
{
    global $meta;
    $results = $meta->get_meta($_POST);

    if (!$results[0]) {
        send_json_response(false, $results[1]);
    } else {
        send_json_response(true, $results[1]);
    }
}

function create_or_update_meta()
{
    global $meta;
    $meta->create_or_update_meta($_POST);
}



// Add action hooks
add_action('wp_ajax_ire_get_meta', 'ire_get_meta');
add_action('wp_ajax_ire_create_or_update_meta', 'create_or_update_meta');
