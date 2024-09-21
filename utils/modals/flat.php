<?php




class IreFlat
{
    private $wpdb;
    private $table_name;

    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'ire_flats';
    }

    public function get_flats($data)
    {
        IreHelper::check_nonce($data['nonce'], 'ire_nonce');
        IreHelper::has_project_id($data);
        $data = IreHelper::sanitize_sorting_parameters($data, ['id', 'title', 'price', 'offer_price', 'conf']);

        if ($data['project_id'] > 0) {
            $offset = ($data['page'] - 1) * $data['per_page'];
            $query = $this->wpdb->prepare(
                "SELECT * FROM $this->table_name WHERE project_id = %d ORDER BY " . esc_sql($data['sort_field']) . " " . esc_sql($data['sort_order']) . " LIMIT %d OFFSET %d",
                $data['project_id'],
                $data['per_page'],
                $offset
            );

            $results = $this->wpdb->get_results($query, ARRAY_A);

            $total_query = $this->wpdb->prepare(
                "SELECT COUNT(*) FROM $this->table_name WHERE project_id = %d",
                $data['project_id']
            );
            $total_results = $this->wpdb->get_var($total_query);

            if (is_wp_error($results)) {
                IreHelper::send_json_response(false, $results->get_error_message());
            } else {
                IreHelper::send_json_response(true, [
                    'data' => $results,
                    'total' => $total_results,
                    'page' => $data['page'],
                    'per_page' => $data['per_page']
                ]);
            }
        } else {
            IreHelper::send_json_response(false, 'Invalid project ID');
        }
    }

    public function create_flat($data)
    {
        IreHelper::check_nonce($data['nonce'], 'ire_nonce');

        $required_fields = ['flat_number', 'price', 'type_id',  'floor_number', 'project_id'];
        $required_data = IreHelper::validate_and_sanitize_input($data, $required_fields);

        if (!$required_data) {
            IreHelper::send_json_response(false, 'Required fields are missing.');
            return;
        }

        $non_required_data = IreHelper::validate_and_sanitize_input($data, ['offer_price', 'conf'], false);
        $data = array_merge($required_data, $non_required_data);

        $this->wpdb->insert($this->table_name, $data);

        if ($this->wpdb->last_error) {
            IreHelper::send_json_response(false, 'Database error');
        } else {
            $new_flat_id = $this->wpdb->insert_id;
            $new_floor =  IreHelper::get($this->table_name, $new_flat_id);

            if (isset($new_floor->polygon_data)) {
                $new_floor->polygon_data = handle_json_data($new_floor->polygon_data);
            }

            $new_floor->floor_image = wp_get_attachment_image_url($new_floor->floor_image, 90);

            IreHelper::send_json_response(true, $new_floor);
        }
    }

    public function update_flat($data)
    {
        IreHelper::check_nonce($data['nonce'], 'ire_nonce');

        $flat_id = isset($data['flat_id']) ? intval($data['flat_id']) : null;

        if (!$flat_id) {
            IreHelper::send_json_response(false, 'flat_id is required');
            return;
        }

        $keys = ['flat_number', 'price', 'type_id', 'floor_number', 'project_id', 'offer_price', 'conf'];
        $params = IreHelper::validate_and_sanitize_input($data, $keys, false);

        $where = ['id' => $flat_id];
        $this->wpdb->update($this->table_name, $params, $where);

        if ($this->wpdb->last_error) {
            IreHelper::send_json_response(false, 'Database error');
        } else {
            IreHelper::send_json_response(true, 'Flat updated successfully');
        }
    }

    public function delete_flat($data)
    {
        IreHelper::check_nonce($data['nonce'], 'ire_nonce');

        $flat_id = isset($data['flat_id']) ? intval($data['flat_id']) : null;

        if (!$flat_id) {
            IreHelper::send_json_response(false, 'flat_id is required');
            return;
        }

        $delete_result = $this->wpdb->delete($this->table_name, ['id' => $flat_id]);

        if ($delete_result) {
            IreHelper::send_json_response(true, 'Flat deleted successfully');
        } else {
            IreHelper::send_json_response(false, 'Database error: ' . $this->wpdb->last_error);
        }
    }
}

// Initialize the class
$flats_manager = new IreFlat();

// Action functions
function ire_get_flats()
{
    global $flats_manager;
    $flats_manager->get_flats($_POST);
}

function ire_create_flat()
{
    global $flats_manager;
    $flats_manager->create_flat($_POST);
}

function ire_update_flat()
{
    global $flats_manager;
    $flats_manager->update_flat($_POST);
}

function ire_delete_flat()
{
    global $flats_manager;
    $flats_manager->delete_flat($_POST);
}

// Add action hooks
add_action('wp_ajax_get_flats', 'ire_get_flats');
add_action('wp_ajax_create_flat', 'ire_create_flat');
add_action('wp_ajax_update_flat', 'ire_update_flat');
add_action('wp_ajax_delete_flat', 'ire_delete_flat');
