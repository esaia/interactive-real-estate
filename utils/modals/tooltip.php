<?php

class IreTooltip
{


    protected $wpdb;
    protected $table_name;

    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'ire_tooltip';
    }


    public function get_tooltip(array $data)
    {
        check_nonce($data['nonce'], 'ire_nonce');
        has_project_id($data);

        $data = sanitize_sorting_parameters($data, ['id', 'title']);
        $offset = ($data['page'] - 1) * $data['per_page'];

        $query = "SELECT * FROM {$this->table_name} WHERE project_id = %d ";
        $params = [$data['project_id']];


        if (!empty($data['search'])) {
            $query .= " AND (title LIKE %s)";
            $searchTerm = '%' . $data['search'] . '%';
            $params[] = $searchTerm;
        }

        $query .= " ORDER BY {$data['sort_field']} {$data['sort_order']} LIMIT %d OFFSET %d";
        $params[] =  $data['per_page'];
        $params[] =   $offset;

        $query = $this->wpdb->prepare(
            $query,
            ...$params
        );

        $results = $this->wpdb->get_results($query, ARRAY_A);


        $results = array_map(
            function ($result) {
                $result['data'] = handle_json_data($result['data']);

                if (isset($result['data']['targetBlank'])) {
                    $result['data']['targetBlank'] = handle_json_data($result['data']['targetBlank']);
                }


                if (isset($result['data']['script'])) {
                    $result['data']['script'] = str_replace('\\', '', $result['data']['script']);;
                }


                return $result;
            },
            $results
        );




        if ($this->wpdb->last_error) {
            return [false,  'No tooltip found.'];
        } else {
            return [true,  $results];
        }
    }


    public function create_tooltip($data)
    {
        check_nonce($data['nonce'], 'ire_nonce');

        $required_fields = ['project_id', 'title'];
        $required_data = validate_and_sanitize_input($data, $required_fields);


        if (!$required_data) {
            send_json_response(false, 'Required fields are missing.');
            return;
        }

        $data = array_merge($required_data,  ['data' => handle_json_data($data['data'])]);

        $this->wpdb->insert($this->table_name, $data);

        if ($this->wpdb->last_error) {
            send_json_response(false, 'Database error');
        } else {
            $new_tooltip_id = $this->wpdb->insert_id;
            $new_tooltip =  get($this->table_name, $new_tooltip_id);

            if (isset($new_tooltip->data)) {
                $new_tooltip->data = handle_json_data($new_tooltip->data);
            }

            send_json_response(true, $new_tooltip);
        }
    }


    public function update_tooltip($data)
    {
        check_nonce($data['nonce'], 'ire_nonce');

        $action_id = isset($data['action_id']) ? intval($data['action_id']) : null;
        if (!$action_id) {
            send_json_response(false, 'action_id is required');
            return;
        }

        $params = ['title' =>  $data['title'], 'data' => handle_json_data($data['data'])];

        $where = ['id' => $action_id];
        $this->wpdb->update($this->table_name, $params, $where);


        if ($this->wpdb->last_error) {
            send_json_response(false, 'Database error');
        } else {
            send_json_response(true, 'Tooltip updated successfully');
        }
    }

    public function delete_tooltip($data)
    {
        check_nonce($data['nonce'], 'ire_nonce');

        $action_id = isset($data['action_id']) ? intval($data['action_id']) : null;
        if (!$action_id) {
            send_json_response(false, 'action_id is required');
            return;
        }

        $delete_result = $this->wpdb->delete($this->table_name, ['id' => $action_id]);

        if ($delete_result) {
            send_json_response(true, 'Action deleted successfully');
        } else {
            send_json_response(false, 'Database error: ' . $this->wpdb->last_error);
        }
    }
}




// Initialize the class
$tooltip = new IreTooltip();

// Action functions
function ire_get_tooltip()
{
    global $tooltip;
    $results = $tooltip->get_tooltip($_POST);

    if (!$results[0]) {
        send_json_response(false, $results[1]);
    } else {
        send_json_response(true, $results[1]);
    }
}



function ire_create_tooltip()
{
    global $tooltip;
    $tooltip->create_tooltip($_POST);
}



function ire_update_tooltip()
{
    global $tooltip;
    $tooltip->update_tooltip($_POST);
}


function ire_delete_tooltip()
{
    global $tooltip;
    $tooltip->delete_tooltip($_POST);
}



// Add action hooks
add_action('wp_ajax_ire_get_tooltip', 'ire_get_tooltip');
add_action('wp_ajax_ire_create_tooltip', 'ire_create_tooltip');
add_action('wp_ajax_ire_update_tooltip', 'ire_update_tooltip');
add_action('wp_ajax_ire_delete_tooltip', 'ire_delete_tooltip');
