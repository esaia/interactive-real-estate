<?php

if (!defined('ABSPATH')) {
    exit;
}

/** 
 * Checks the nonce for security and validates the action.
 * 
 * @param string|null $nonce The nonce to verify.
 * @param string $action The action name to verify against the nonce.
 * 
 * @return void Exits and sends an error if the nonce is invalid.
 */
function irep_check_nonce(?string $nonce, string $action): void
{
    if (!(isset($nonce) && wp_verify_nonce($nonce, $action))) {
        wp_send_json_error('Invalid nonce');
        exit;
    }
}

/** 
 * Sends a JSON response based on success or failure.
 * 
 * @param bool $success Indicates whether the operation was successful.
 * @param mixed $message The message to return in the response.
 * 
 * @return void Sends a JSON success or error response.
 */
function irep_send_json_response(bool $success, $message): void
{
    if ($success) {
        wp_send_json_success($message);
    } else {
        wp_send_json_error($message);
    }
}

/** 
 * Handles JSON data by encoding or decoding it.
 * 
 * @param mixed $data The data to be handled, either JSON string or an array.
 * 
 * @return mixed|null The decoded data if valid JSON, or null if there is a decoding error.
 */
function irep_handle_json_data($data)
{
    if (is_array($data)) {
        return wp_json_encode($data);
    }

    $decoded = json_decode($data, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        return null;
    }

    return $decoded;
}

/** 
 * Validates and sanitizes input data by checking for required fields and sanitizing their values.
 * 
 * @param array $data The input data to be validated and sanitized.
 * @param array $keys The keys to check in the data array.
 * @param bool $required Indicates whether the fields are mandatory.
 * 
 * @return array|null The sanitized data or null if required fields are missing or invalid.
 */
function irep_validate_and_sanitize_input(array $data, array $keys, bool $required = true): ?array
{
    $sanitized_data = [];
    foreach ($keys as $key) {
        if (array_key_exists($key, $data)) {

            // Handle different types of inputs
            if (is_string($data[$key]) && is_email($data[$key])) {
                $sanitized_data[$key] = sanitize_email($data[$key]);
            } elseif (is_string($data[$key]) && isset($data[$key]) && $data[$key] !== '') {
                $sanitized_data[$key] = sanitize_text_field($data[$key]);
            } elseif (is_numeric($data[$key]) && isset($data[$key]) && $data[$key] > 0) {
                $sanitized_data[$key] = floatval($data[$key]);
            } else if (is_bool($data[$key])) {
                $sanitized_data[$key] =  $data[$key];
            } else {
                $sanitized_data[$key] =  $data[$key] ?  $data[$key] : null;
            }


            if ((!isset($sanitized_data[$key]) || !$sanitized_data[$key]) && $required) {
                return null;  // Return null if data is required and sanitization fails
            }
        } elseif ($required) {
            return null;  // Return null if a required field is missing
        }
    }


    return $sanitized_data;
}

/** 
 * Dumps data to the error log and stops execution.
 * 
 * @param mixed $data The data to log.
 * 
 * @return void Stops execution after logging the data.
 */
function irep_dd($data): void
{
    error_log(print_r($data, true));
    die();
}

/** 
 * Retrieves detailed information about an image by its ID.
 * 
 * @param int $image_id The ID of the image.
 * 
 * @return array|null An array with image data or null if no image is found.
 */
function irep_get_image_instance(int $image_id): ?array
{
    $image_post = get_post($image_id);
    if (!$image_post) {
        return null;
    }

    $image_url = wp_get_attachment_url($image_id);
    $image_meta = wp_get_attachment_metadata($image_id);
    $image_alt = get_post_meta($image_id, '_wp_attachment_image_alt', true);
    $image_title = get_the_title($image_id);
    $image_filename = basename(get_attached_file($image_id));
    $image_author_id = $image_post->post_author;
    $image_author = get_the_author_meta('display_name', $image_author_id);
    $image_description = $image_post->post_content;
    $image_caption = $image_post->post_excerpt;
    $image_date = $image_post->post_date;
    $image_modified = $image_post->post_modified;
    $image_mime = get_post_mime_type($image_id);
    $filesize = filesize(get_attached_file($image_id));
    $filesize_human = size_format($filesize);
    $image_sizes = wp_get_attachment_metadata($image_id)['sizes'] ?? [];

    return [
        'id' => (int) $image_id,
        'title' => $image_title,
        'filename' => $image_filename,
        'url' => $image_url,
        'link' => get_permalink($image_id),
        'alt' => $image_alt,
        'author' => $image_author,
        'description' => $image_description,
        'caption' => $image_caption,
        'name' => $image_post->post_name,
        'status' => $image_post->post_status,
        'uploadedTo' => (int) $image_post->post_parent,
        'date' => $image_date,
        'modified' => $image_modified,
        'menuOrder' => (int) $image_post->menu_order,
        'mime' => $image_mime,
        'type' => 'image',
        'subtype' => strtolower(str_replace('image/', '', $image_mime)),
        'icon' => wp_mime_type_icon($image_mime),
        'dateFormatted' => get_the_date('', $image_post),
        'nonces' => [],
        'editLink' => get_edit_post_link($image_id),
        'meta' => true,
        'authorName' => get_the_author_meta('display_name', $image_author_id),
        'authorLink' => get_author_posts_url($image_author_id),
        'filesizeInBytes' => $filesize,
        'filesizeHumanReadable' => $filesize_human,
        'context' => '',
        'originalImageURL' => $image_url,
        'originalImageName' => $image_filename,
        'height' => $image_meta['height'] ?? 0,
        'width' => $image_meta['width'] ?? 0,
        'orientation' => ($image_meta['height'] > $image_meta['width']) ? 'portrait' : 'landscape',
        'sizes' => $image_sizes,
        'compat' => [],
    ];
}

/** 
 * Sanitizes sorting parameters for queries.
 * 
 * @param array $data The data containing sorting parameters.
 * @param array $allowedSortFields The list of allowed sort fields.
 * 
 * @return array The sanitized and formatted sorting parameters.
 */
function irep_sanitize_sorting_parameters(array $data, array $allowedSortFields)
{
    $allowedSortOrders = ['ASC', 'DESC'];

    $data['sort_field'] = isset($data['sort_field']) && in_array($data['sort_field'], $allowedSortFields)
        ? $data['sort_field']
        : 'id';

    $data['sort_order'] = isset($data['sort_order']) && in_array($data['sort_order'], $allowedSortOrders)
        ? $data['sort_order']
        : 'ASC';

    $data['page'] = isset($data['page']) ? intval($data['page']) : 1;
    $data['per_page'] = isset($data['per_page']) ? intval($data['per_page']) : 8;
    $data['offset'] = ($data['page'] - 1) * $data['per_page'];

    return $data;
}

/** 
 * Retrieves a row from the database table.
 * 
 * @param string $table_name The name of the table.
 * @param int $id The ID of the row to retrieve.
 * 
 * @return object|null The row as an object, or null if no row is found.
 */
function irep_get($table_name, $id)
{
    global $wpdb;

    // Ensure table_name only contains valid characters (letters, numbers, and underscores)
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $table_name)) {
        return null; // Return null if the table name is not valid
    }

    // Prepare the SQL query with the sanitized table name
    // $query = $wpdb->prepare("SELECT * FROM {$table_name} WHERE id = %d", intval($id));

    // Execute the query
    return $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table_name} WHERE id = %d", intval($id)));
}

/** 
 * Checks if a project ID is present and valid.
 * 
 * @param array $data The input data.
 * 
 * @return void Sends a response if project_id is missing or invalid.
 */
function irep_has_project_id(array $data)
{
    $data = irep_validate_and_sanitize_input($data, ['project_id']);

    if (!$data || $data['project_id'] < 0) {
        irep_send_json_response(false, 'project_id is Required!');
        return;
    }
}

/** 
 * Handles database duplicate errors and sends an appropriate response.
 * 
 * @param object $wpdb The WordPress database object.
 * @param string $duplicateMessage The message to send in case of a duplicate entry.
 * @param string $defaultErrorMessage The default error message if no specific error is found.
 * 
 * @return void Sends a JSON response indicating the error.
 */
function irep_database_duplicate_error($wpdb, $duplicateMessage, $defaultErrorMessage = 'Database error')
{
    if ($wpdb->last_error && strpos($wpdb->last_error, 'Duplicate entry') !== false) {
        irep_send_json_response(false, $duplicateMessage);
    } else {
        irep_send_json_response(false, $defaultErrorMessage . ': ' . $wpdb->last_error);
    }
}

/** 
 * Checks if required data fields are present and valid.
 * 
 * @param mixed $data The input data.
 * @param array $required_fields The list of required fields.
 * 
 * @return array|null The sanitized data if valid, or null if fields are missing.
 */
function irep_check_required_data($data, $required_fields)
{
    $required_data = irep_validate_and_sanitize_input($data, $required_fields, true);


    if (!$required_data) {
        irep_send_json_response(false, 'Required fields are missing.');
        return;
    }
    return $required_data;
}

/** 
 * Transforms an SVG string by cleaning and unescaping certain parts.
 * 
 * @param string $svgString The SVG content as a string.
 * 
 * @return string The transformed SVG string.
 */
function irep_transformSvgString($svgString)
{
    // Return empty string if input is null
    if ($svgString === null) {
        return '';
    }

    // Remove backslashes (only if string contains them)
    $transformedSvg = is_string($svgString) ? str_replace('\\', '', $svgString) : '';

    // Unescape HTML entities (safer approach)
    $transformedSvg = htmlspecialchars_decode($transformedSvg, ENT_QUOTES | ENT_HTML5);

    // Fix empty attributes - only process if string is not empty
    if ($transformedSvg !== '') {
        $transformedSvg = preg_replace('/(\s+[a-zA-Z0-9-]+)=""/', '$1=""', $transformedSvg);
    }

    return $transformedSvg;
}


function irep_upgrade_plan()
{
    irep_send_json_response(false, 'Upgrade plan.');
}


function irep_get_translations()
{

    $translations = IREP_PLUGIN_NAME === 'Interactive Real Estate' ?
        [
            'floor' => __('floor',  'interactive-real-estate'),
            'available' => __('available',  'interactive-real-estate'),
            'reserved' => __('reserved',  'interactive-real-estate'),
            'sold' => __('sold',  'interactive-real-estate'),
            'apartment' => __('apartment',  'interactive-real-estate'),
            'back' => __('back',  'interactive-real-estate'),
            '2d plan' => __('2d plan',  'interactive-real-estate'),
            '3d plan' => __('3d plan',  'interactive-real-estate'),
            'price' => __('price',  'interactive-real-estate'),
            'area' => __('area',  'interactive-real-estate'),
            'room' => __('room',  'interactive-real-estate'),
            'starting from' => __('starting from',  'interactive-real-estate'),
            'no data available' => __('No data available',  'interactive-real-estate'),
        ]
        :
        [
            'floor' => __('floor',  'interactive-real-estate-premium'),
            'available' => __('available',  'interactive-real-estate-premium'),
            'reserved' => __('reserved',  'interactive-real-estate-premium'),
            'sold' => __('sold',  'interactive-real-estate-premium'),
            'apartment' => __('apartment',  'interactive-real-estate-premium'),
            'back' => __('back',  'interactive-real-estate-premium'),
            '2d plan' => __('2d plan',  'interactive-real-estate-premium'),
            '3d plan' => __('3d plan',  'interactive-real-estate-premium'),
            'price' => __('price',  'interactive-real-estate-premium'),
            'area' => __('area',  'interactive-real-estate-premium'),
            'room' => __('room',  'interactive-real-estate-premium'),
            'starting from' => __('starting from',  'interactive-real-estate-premium'),
            'no data available' => __('No data available',  'interactive-real-estate-premium'),
        ];

    return $translations;
}
