<?php

if (!defined('ABSPATH')) {
    exit;
}
/**
 * Class Irep_Flat
 *
 * Handles operations related to flats in the project management system.
 * Provides methods to create, update, retrieve, and delete flats from the database.
 */
class Irep_Flat
{
    private $wpdb;
    private $table_name;

    /**
     * Irep_Flat constructor.
     *
     * Initializes the global $wpdb object and sets the table name for flats.
     */
    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name =  'irep_flats';
    }

    /**
     * Retrieves flats from the database based on given parameters.
     *
     * @param array $data An associative array containing the request data:
     * 
     * @return array A two-element array:
     *               - bool: Success status of the operation.
     *               - array: The data, containing the flat records, total count, page, and per-page values.
     */
    public function get_flats($data)
    {
        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'project_id'   => isset($data['project_id']) ? absint($data['project_id']) : 0,
            'sort_field'   => isset($data['sort_field']) ? sanitize_text_field($data['sort_field']) : '',
            'sort_order'   => isset($data['sort_order']) ? sanitize_text_field($data['sort_order']) : '',
            'block'        => isset($data['block']) && $data['block'] !== 'null' ? sanitize_text_field($data['block']) : 'null',
            'floor'        => isset($data['floor']) ? absint($data['floor']) : 0,
            'search'       => isset($data['search']) ? sanitize_text_field($data['search']) : '',
            'page'         => isset($data['page']) ? absint($data['page']) : 1,
            'per_page'     => isset($data['per_page']) ? absint($data['per_page']) : 8,
            'offset'       => isset($data['page']) ? (absint($data['page']) - 1) * absint($data['per_page']) : 0,
        ];

        irep_check_nonce($data['nonce'], 'irep_nonce');
        irep_has_project_id($data);

        if (empty($data['project_id']) || $data['project_id'] <= 0) {
            irep_send_json_response(false, 'Invalid project_id provided!');
            return;
        }

        // Sanitize and filter sorting parameters
        $data = irep_sanitize_sorting_parameters($data, ['id', 'title', 'floor_number', 'price', 'offer_price', 'conf', 'block_id']);

        $query = Irep_DB::table($this->table_name);
        $searchTerm = '%' . $data['search'] . '%';

        $query->where('project_id', '=', $data['project_id']);

        if (!empty($data['search'])) {
            $query->where('flat_number', 'LIKE', $searchTerm)
                ->orWhere('id', 'LIKE', $searchTerm)
                ->orWhere('price', 'LIKE', $searchTerm)
                ->orWhere('offer_price', 'LIKE', $searchTerm);
        }

        $results = $query->orderBy($data['sort_field'], $data['sort_order'])
            ->paginate($data['page'], $data['per_page']);


        if (!$results) {
            return [false,  'something went wrong!'];
        } else {
            // Map the block data to a more usable format
            if ($results['data']) {
                $results['data'] = array_map([$this, 'map_flats'], $results['data']);
            }

            return [true, $results];
        }
    }

    /**
     * Creates a new flat and inserts it into the database.
     *
     * @param array $data An associative array containing the flat data:
     * 
     * @return void
     */
    public function create_flat($data)
    {

        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'       => isset($data['action']) ? sanitize_key($data['action']) : '',
            'flat_id'      => isset($data['flat_id']) ? absint($data['flat_id']) : 0,
            'flat_number'  => isset($data['flat_number']) ? sanitize_text_field($data['flat_number']) : '',
            'conf'         => isset($data['conf']) ? sanitize_text_field($data['conf']) : '',
            'type_id'      => isset($data['type_id']) ? absint($data['type_id']) : 0,
            'floor_number' => isset($data['floor_number']) ? absint($data['floor_number']) : 0,
            'price'        => isset($data['price']) ? floatval($data['price']) : 0.0,
            'offer_price'  => isset($data['offer_price']) ? floatval($data['offer_price']) : 0.0,
            'block_id'     => isset($data['block_id']) ? absint($data['block_id']) : 0,
            'type' => [
                'title'       => isset($data['type']['title']) ? sanitize_text_field($data['type']['title']) : '',
                'teaser'      => isset($data['type']['teaser']) ? sanitize_textarea_field($data['type']['teaser']) : '',
                'area_m2'     => isset($data['type']['area_m2']) ? floatval($data['type']['area_m2']) : 0.0,
                'image_2d'    => isset($data['type']['image_2d']) && is_array($data['type']['image_2d'])
                    ? array_map('absint', $data['type']['image_2d'])
                    : [],
                'image_3d'    => isset($data['type']['image_3d']) && is_array($data['type']['image_3d'])
                    ? array_map('absint', $data['type']['image_3d'])
                    : [],
                'rooms_count' => isset($data['type']['rooms_count']) ? absint($data['type']['rooms_count']) : 0,
            ],
            'project_id'   => isset($data['project_id']) ? absint($data['project_id']) : 0,
            'use_type'     => isset($data['use_type']) && rest_sanitize_boolean($data['use_type'])
        ];

        $this->canUserAddFlat($data);

        irep_check_nonce($data['nonce'], 'irep_nonce');

        // Define required and non-required fields
        $required_fields = ['flat_number', 'price', 'project_id'];
        $non_required_fields = ['floor_number', 'offer_price', 'conf', 'block_id', 'use_type'];

        // Adjust required fields based on use type
        if ($data['use_type']) {
            $required_fields[] = 'type_id';
        } else {
            $non_required_fields[] = 'type_id';
        }

        // Sanitize and validate required and non-required data
        $required_data = irep_check_required_data($data, $required_fields);
        $non_required_data = irep_validate_and_sanitize_input($data, $non_required_fields, false);

        // Merge the data and prepare it for insertion
        $params = array_merge($required_data, $non_required_data);

        // Handle the type data as JSON
        $params['type'] = irep_handle_json_data($data['type']);

        $flat_id = Irep_DB::table($this->table_name)->create($params);

        if (!$flat_id) {
            irep_send_json_response(false, 'Database error');
        } else {
            $created_type =  Irep_DB::table($this->table_name)->find($flat_id);
            $transformed = $this->map_flats($created_type);

            irep_send_json_response(true, $transformed);
        }
    }

    /**
     * Updates an existing flat with new data.
     *
     * @param array $data An associative array containing the updated flat data:
     * 
     * @return void
     */
    public function update_flat($data)
    {

        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'       => isset($data['action']) ? sanitize_key($data['action']) : '',
            'flat_id'      => isset($data['flat_id']) ? absint($data['flat_id']) : 0,
            'flat_number'  => isset($data['flat_number']) ? sanitize_text_field($data['flat_number']) : '',
            'conf'         => isset($data['conf']) ? sanitize_text_field($data['conf']) : '',
            'type_id'      => isset($data['type_id']) ? absint($data['type_id']) : 0,
            'floor_number' => isset($data['floor_number']) ? absint($data['floor_number']) : 0,
            'price'        => isset($data['price']) ? floatval($data['price']) : 0.0,
            'offer_price'  => isset($data['offer_price']) ? floatval($data['offer_price']) : 0.0,
            'block_id'     => isset($data['block_id']) ? absint($data['block_id']) : 0,
            'type' => [
                'title'       => isset($data['type']['title']) ? sanitize_text_field($data['type']['title']) : '',
                'teaser'      => isset($data['type']['teaser']) ? sanitize_textarea_field($data['type']['teaser']) : '',
                'area_m2'     => isset($data['type']['area_m2']) ? floatval($data['type']['area_m2']) : 0.0,
                'image_2d'    => isset($data['type']['image_2d']) && is_array($data['type']['image_2d'])
                    ? array_map('absint', $data['type']['image_2d'])
                    : [],
                'image_3d'    => isset($data['type']['image_3d']) && is_array($data['type']['image_3d'])
                    ? array_map('absint', $data['type']['image_3d'])
                    : [],
                'rooms_count' => isset($data['type']['rooms_count']) ? absint($data['type']['rooms_count']) : 0,
            ],
            'project_id'   => isset($data['project_id']) ? absint($data['project_id']) : 0,
            'use_type'     => isset($data['use_type']) && rest_sanitize_boolean($data['use_type'])
        ];

        irep_check_nonce($data['nonce'], 'irep_nonce');

        // Ensure the flat ID is provided
        $flat_id = isset($data['flat_id']) ? intval($data['flat_id']) : null;
        if (!$flat_id) {
            irep_send_json_response(false, 'flat_id is required');
            return;
        }

        // Define required fields
        $required_fields = ['flat_number', 'price'];
        if (isset($data['use_type']) && $data['use_type']) {
            $required_fields[] = 'type_id';
        }

        // Sanitize and validate required fields
        $required_data = irep_check_required_data($data, $required_fields);

        // Define and validate optional fields
        $keys = ['floor_number', 'project_id', 'block_id', 'offer_price', 'conf', 'use_type'];
        $params = irep_validate_and_sanitize_input($data, $keys, false);

        // Merge required and optional fields
        $params = array_merge($required_data, $params);

        // Handle block ID and type data
        if (!isset($params['block_id'])) {
            $params['block_id'] = null;
        }

        $params['type'] = irep_handle_json_data($data['type']);

        $updated_flat = Irep_DB::table($this->table_name)->where('id', '=',  $flat_id)->update($params);


        if ($updated_flat->last_error) {
            irep_send_json_response(false, 'Database error');
        } else {
            irep_send_json_response(true, 'Flat updated successfully');
        }
    }

    /**
     * Deletes a flat from the database.
     *
     * @param array $data An associative array containing the flat ID and nonce:
     *                    - nonce (string) The nonce for security validation.
     *                    - flat_id (int) The ID of the flat to delete.
     * 
     * @return void
     */
    public function delete_flat($data)
    {
        irep_check_nonce($data['nonce'], 'irep_nonce');

        // Ensure the flat ID is provided
        $flat_id = isset($data['flat_id']) ? intval($data['flat_id']) : null;
        if (!$flat_id) {
            irep_send_json_response(false, 'flat_id is required');
            return;
        }


        $deleted_flat = Irep_DB::table($this->table_name)->where('id', '=',  $flat_id)->delete();


        if ($deleted_flat) {
            irep_send_json_response(true, 'Flat deleted successfully');
        } else {
            irep_send_json_response(false, 'Database error: ' . $this->wpdb->last_error);
        }
    }

    /**
     * Maps the flat data to a more usable format.
     *
     * @param array $item The flat data to be mapped.
     * 
     * @return array The mapped flat data.
     */
    private function map_flats($item)
    {
        if (is_object($item)) {
            $item = (array) $item;
        }


        // Handle 'use_type' field as a boolean
        $item['use_type'] =  $item['use_type'] === '1';

        // Process the type data if available
        if ($item['type']) {
            $item['type'] = irep_handle_json_data($item['type']);
        }

        // Process image data for 2D and 3D images, if available
        if (is_array($item['type']) && isset($item['type']['image_2d']) && !empty($item['type']['image_2d'])) {
            $item['type']['image_2d'] = array_map('irep_get_image_instance', $item['type']['image_2d']);
        }
        if (is_array($item['type']) && isset($item['type']['image_3d']) && !empty($item['type']['image_3d'])) {
            $item['type']['image_3d'] = array_map('irep_get_image_instance', $item['type']['image_3d']);
        }

        return $item;
    }


    public function canUserAddFlat($data)
    {
        $flats = $this->get_flats($data)[1]['total'];

        $check = !ire_fs()->can_use_premium_code() && $flats >= 25;

        if ($check) {
            irep_upgrade_plan();
        }
    }
}

// Initialize the class
$irep_flats_manager = new Irep_Flat();

// Action functions

/**
 * Handles the AJAX request to retrieve flats.
 */
function irep_get_flats()
{
    global $irep_flats_manager;

    // Get the results and send the response
    $results = $irep_flats_manager->get_flats($_POST);

    if (is_array($results) && isset($results[0], $results[1])) {
        if (!$results[0]) {
            irep_send_json_response(false, $results[1]);
        } else {
            irep_send_json_response(true, $results[1]);
        }
    } else {
        irep_send_json_response(false, 'No flats found or invalid response format');
    }
}

/**
 * Handles the AJAX request to create a flat.
 */
function irep_create_flat()
{
    global $irep_flats_manager;
    $irep_flats_manager->create_flat($_POST);
}

/**
 * Handles the AJAX request to update a flat.
 */
function irep_update_flat()
{
    global $irep_flats_manager;
    $irep_flats_manager->update_flat($_POST);
}

/**
 * Handles the AJAX request to delete a flat.
 */
function irep_delete_flat()
{
    global $irep_flats_manager;
    $irep_flats_manager->delete_flat($_POST);
}

// Add action hooks for AJAX requests
add_action('wp_ajax_irep_get_flats', 'irep_get_flats');
add_action('wp_ajax_irep_create_flat', 'irep_create_flat');
add_action('wp_ajax_irep_update_flat', 'irep_update_flat');
add_action('wp_ajax_irep_delete_flat', 'irep_delete_flat');
