<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Irep_Type
 *
 * Handles CRUD operations for property types (e.g., residential, commercial) in the project management system.
 * This includes methods to retrieve, create, update, and delete types from the database.
 */
class Irep_Type
{
    protected $wpdb;
    protected $table_name;

    /**
     * Irep_Type constructor.
     *
     * Initializes the global $wpdb object and sets the table name for property types.
     */
    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = 'irep_types';
    }

    /**
     * Retrieves property types from the database based on provided filters and pagination.
     *
     * @param array $data The request data:
     * 
     * @return array A two-element array:
     *               - bool: Success status of the operation.
     *               - array: The data, including the property types, total count, page, and per-page values.
     */
    public function get_types($data)
    {
        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'project_id'   => isset($data['project_id']) ? absint($data['project_id']) : 0,
            'sort_field'   => isset($data['sort_field']) ? sanitize_text_field($data['sort_field']) : '',
            'sort_order'   => isset($data['sort_order']) ? sanitize_text_field($data['sort_order']) : '',
            'page'         => isset($data['page']) ? absint($data['page']) : 1,
            'per_page'     => isset($data['per_page']) ? absint($data['per_page']) : 8,
            'search'       => isset($data['search']) ? sanitize_text_field($data['search']) : '',
        ];


        irep_check_nonce($data['nonce'], 'irep_nonce');
        irep_has_project_id($data);

        // Sanitize and filter sorting parameters
        $data = irep_sanitize_sorting_parameters($data, ['id', 'title', 'area_m2']);

        $query = Irep_DB::table($this->table_name);
        $searchTerm = '%' . $data['search'] . '%';

        $query->where('project_id', '=', $data['project_id']);


        if (!empty($data['search'])) {
            $query->where('title', 'LIKE', $searchTerm)
                ->orWhere('id', 'LIKE', $searchTerm)
                ->orWhere('teaser', 'LIKE', $searchTerm)
                ->orWhere('area_m2', 'LIKE', $searchTerm)
                ->orWhere('rooms_count', 'LIKE', $searchTerm);
        }


        $results = $query->orderBy($data['sort_field'], $data['sort_order'])
            ->paginate($data['page'], $data['per_page']);


        if (!$results) {
            return [false,  'something went wrong!'];
        } else {
            // Map the block data to a more usable format
            if ($results['data']) {
                $results['data'] = array_map([$this, 'map_images'], $results['data']);
            }

            return [true, $results];
        }
    }

    /**
     * Creates a new property type and inserts it into the database.
     *
     * @param array $data The data for the new property type:
     * 
     * @return void
     */
    public function create_type($data)
    {

        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'       => isset($data['action']) ? sanitize_key($data['action']) : '',
            'type_id'      => isset($data['type_id']) ? absint($data['type_id']) : 0,
            'title'        => isset($data['title']) ? sanitize_text_field($data['title']) : '',
            'teaser'       => isset($data['teaser']) ? sanitize_text_field($data['teaser']) : '',
            'area_m2'      => isset($data['area_m2']) ? floatval($data['area_m2']) : 0,
            'rooms_count'  => isset($data['rooms_count']) ? absint($data['rooms_count']) : 0,
            'click_action' => isset($data['click_action']) ? sanitize_text_field($data['click_action']) : '',
            'follow_link'  => isset($data['follow_link']) ? sanitize_text_field($data['follow_link']) : '',
            'project_id'   => isset($data['project_id']) ? absint($data['project_id']) : 0,
            'image_2d'     => $data['image_2d'],
            'image_3d'     => $data['image_3d'],
        ];


        irep_check_nonce($data['nonce'], 'irep_nonce');
        irep_has_project_id($data);

        // Sanitize and validate required data
        $required_data = irep_check_required_data($data, ['title', 'project_id', 'area_m2']);

        // Optional fields
        $non_required_fields = ['teaser', 'rooms_count', 'click_action', 'follow_link'];
        $non_required_data = irep_validate_and_sanitize_input($data, $non_required_fields, false);

        // Handle image fields (2D, 3D, and gallery) if provided
        if (!empty($data['image_2d'])) {
            $non_required_data['image_2d'] = irep_handle_json_data($data['image_2d']);
        }

        if (!empty($data['image_3d'])) {
            $non_required_data['image_3d'] = irep_handle_json_data($data['image_3d']);
        }

        // Merge required and optional data before inserting into the database
        $data = array_merge($required_data, $non_required_data);



        $type_id = Irep_DB::table($this->table_name)->create($data);

        if (!$type_id) {
            irep_send_json_response(false, 'Database error');
        } else {
            $created_type =  Irep_DB::table($this->table_name)->find($type_id);
            $transformed = $this->map_images($created_type);

            irep_send_json_response(true, $transformed);
        }
    }

    /**
     * Updates an existing property type in the database.
     *
     * @param array $data The data to update:
     * 
     * @return void
     */
    public function update_type($data)
    {

        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'       => isset($data['action']) ? sanitize_key($data['action']) : '',
            'type_id'      => isset($data['type_id']) ? absint($data['type_id']) : 0,
            'title'        => isset($data['title']) ? sanitize_text_field($data['title']) : '',
            'teaser'       => isset($data['teaser']) ? sanitize_text_field($data['teaser']) : '',
            'area_m2'      => isset($data['area_m2']) ? floatval($data['area_m2']) : 0,
            'rooms_count'  => isset($data['rooms_count']) ? absint($data['rooms_count']) : 0,
            'click_action' => isset($data['click_action']) ? sanitize_text_field($data['click_action']) : '',
            'follow_link'  => isset($data['follow_link']) ? sanitize_text_field($data['follow_link']) : '',
            'project_id'   => isset($data['project_id']) ? absint($data['project_id']) : 0,
            'image_2d'     => isset($data['image_2d']) ? $data['image_2d'] : '',
            'image_3d'     => isset($data['image_3d']) ? $data['image_3d'] : '',
        ];

        irep_check_nonce($data['nonce'], 'irep_nonce');
        irep_has_project_id($data);



        // Ensure the type ID is provided
        $type_id = isset($data['type_id']) ? intval($data['type_id']) : null;
        if (!$type_id) {
            irep_send_json_response(false, 'type_id is required');
            return;
        }

        // Validate the required fields
        $required_data = irep_check_required_data($data, ['title', 'area_m2']);

        // Optional fields
        $keys = ['teaser', 'rooms_count', 'click_action', 'follow_link'];
        $params = irep_validate_and_sanitize_input($data, $keys, false);

        // Merge required and optional fields
        $params = array_merge($required_data, $params);


        $params['image_2d'] = irep_handle_json_data($data['image_2d']) ?? null;
        $params['image_3d'] = irep_handle_json_data($data['image_3d']) ?? null;


        $updated_block = Irep_DB::table($this->table_name)->where('id', '=',  $type_id)->update($params);


        if ($updated_block->last_error) {
            irep_send_json_response(false, 'Database error');
        } else {
            irep_send_json_response(true, 'Type updated successfully');
        }
    }

    /**
     * Deletes a property type from the database.
     *
     * @param array $data The data containing the type ID to delete.
     * 
     * @return void
     */
    public function delete_type($data)
    {
        irep_check_nonce($data['nonce'], 'irep_nonce');

        // Ensure the type ID is provided
        $type_id = isset($data['type_id']) ? intval($data['type_id']) : null;
        if (!$type_id) {
            irep_send_json_response(false, 'type_id is required');
            return;
        }

        $deleted_type = Irep_DB::table($this->table_name)->where('id', '=',  $type_id)->delete();


        if ($deleted_type) {
            irep_send_json_response(true, 'Type deleted successfully');
        } else {
            irep_send_json_response(false, 'Database error: ' . $this->wpdb->last_error);
        }
    }

    /**
     * Maps the images (2D, 3D, gallery) to their respective instances.
     *
     * @param array $item The property type item.
     * 
     * @return array The modified property type with image instances.
     */
    private function map_images($item)
    {
        if (is_object($item)) {
            $item = (array) $item;
        }

        // Handle 2D images
        if ($item['image_2d']) {
            $image_2d_ids = irep_handle_json_data($item['image_2d']);
            $item['image_2d'] = array_map('irep_get_image_instance', $image_2d_ids);
        }

        // Handle 3D images
        if ($item['image_3d']) {
            $image_3d_ids = irep_handle_json_data($item['image_3d']);
            $item['image_3d'] = array_map('irep_get_image_instance', $image_3d_ids);
        }

        // Return the modified item
        return $item;
    }
}

// Initialize the class
$irep_type = new Irep_Type();

// Action functions
function irep_get_types()
{
    global $irep_type;

    $results = $irep_type->get_types($_POST);

    if ($results === null) {
        irep_send_json_response(false, 'something went wrong!');
    }

    if (!$results[0]) {
        irep_send_json_response(false, $results[1]);
    } else {
        irep_send_json_response(true, $results[1]);
    }
}

function irep_create_type()
{
    global $irep_type;
    $irep_type->create_type($_POST);
}

function irep_update_type()
{
    global $irep_type;
    $irep_type->update_type($_POST);
}

function irep_delete_type()
{
    global $irep_type;
    $irep_type->delete_type($_POST);
}

// Add action hooks
add_action('wp_ajax_irep_get_types', 'irep_get_types');
add_action('wp_ajax_irep_create_type', 'irep_create_type');
add_action('wp_ajax_irep_update_type', 'irep_update_type');
add_action('wp_ajax_irep_delete_type', 'irep_delete_type');
