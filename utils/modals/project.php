<?php

class IreProject
{


    protected $wpdb;
    protected $table_name;

    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'ire_projects';
    }


    public function get_projects(array $data)
    {

        check_nonce($data['nonce'], 'ire_nonce');
        $project_id = isset($data['project_id']) ? intval($data['project_id']) : null;


        if ($project_id) {
            $result = $this->wpdb->get_row($this->wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $project_id));


            if ($result) {
                $result->project_image = [get_image_instance($result->project_image)];
                $result->polygon_data = json_decode($result->polygon_data);
            }
        } else {
            $result = $this->wpdb->get_results("SELECT * FROM {$this->table_name} ORDER BY id DESC");

            if ($result) {
                $result = array_map(function ($item) {
                    $item->polygon_data = json_decode($item->polygon_data);
                    $item->project_image = [get_image_instance($item->project_image)];
                    return $item;
                }, $result);
            }
        }



        if ($this->wpdb->last_error) {

            return [false,  'No projects found.'];
        } else {
            return [true,  $result];
        }
    }

    public function create_project($data)
    {
        check_nonce($data['nonce'], 'ire_nonce');

        $title = isset($data['title']) ? sanitize_text_field($data['title']) : '';
        $project_image = isset($data['project_image']) ? sanitize_text_field($data['project_image']) : '';
        $slug = sanitize_title($title);

        $this->wpdb->insert(
            $this->table_name,
            [
                'title' => $title,
                'project_image' => $project_image,
                'svg' => '',
                'slug' => $slug
            ]
        );

        if ($this->wpdb->last_error) {
            send_json_response(false, 'Database error');
        } else {
            send_json_response(true, 'Project added');
        }
    }

    public function update_project($data)
    {
        check_nonce($data['nonce'], 'ire_nonce');

        $project_id = isset($data['projectId']) ? intval($data['projectId']) : null;
        $keys = ['svg', 'title', 'polygon_data', 'project_image'];

        $params = array_filter($data, function ($key) use ($keys) {
            return in_array($key, $keys);
        }, ARRAY_FILTER_USE_KEY);

        $params['polygon_data'] = json_encode($params['polygon_data'] ?? '');

        $where = ['id' => $project_id];
        $this->wpdb->update($this->table_name, $params, $where);

        if ($this->wpdb->last_error) {
            send_json_response(false, 'No projects found.');
        } else {
            send_json_response(true, 'Project updated');
        }
    }
}



// Initialize the class
$project = new IreProject();

// Action functions
function ire_get_projects()
{
    global $project;
    $results = $project->get_projects($_POST);

    if (!$results[0]) {
        send_json_response(false, $results[1]);
    } else {
        send_json_response(true, $results[1]);
    }
}

function ire_create_project()
{
    global $project;
    $project->create_project($_POST);
}

function ire_update_project()
{
    global $project;
    $project->update_project($_POST);
}



// Add action hooks
add_action('wp_ajax_get_projects', 'ire_get_projects');
add_action('wp_ajax_create_project', 'ire_create_project');
add_action('wp_ajax_update_project', 'ire_update_project');
