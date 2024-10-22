<?php

function check_nonce(?string $nonce, string $action): void
{
    if (!(isset($nonce) && wp_verify_nonce($nonce, $action))) {
        wp_send_json_error('Invalid nonce');
        exit;
    }
}

function send_json_response(bool $success, $message): void
{
    if ($success) {
        wp_send_json_success($message);
    } else {
        wp_send_json_error($message);
    }
}

function handle_json_data($data)
{
    return is_array($data) ? json_encode($data) : json_decode($data);
}

function validate_and_sanitize_input(array $data, array $keys, bool $required = true): ?array
{
    $sanitized_data = [];
    foreach ($keys as $key) {
        if (array_key_exists($key, $data)) {

            $sanitized_data[$key] = isset($data[$key]) && is_string($data[$key]) && !empty(($data[$key]))
                ? sanitize_text_field($data[$key])
                : null;

            if (!$sanitized_data[$key] && $required) {
                return null;
            }
        } elseif ($required) {
            return null;
        }
    }
    return $sanitized_data;
}

function dd($data): void
{
    error_log(print_r($data, true));
    die();
}

function get_image_instance(int $image_id): ?array
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

function sanitize_sorting_parameters(array $data, array $allowedSortFields)
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

function get($table_name, $id)
{
    global $wpdb;

    if (!preg_match('/^[a-zA-Z0-9_]+$/', $table_name)) {
        return null;
    }

    return $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table_name} WHERE id = %d", intval($id)));
}

function has_project_id(array $data)
{
    $data = validate_and_sanitize_input($data, ['project_id']);

    if (!$data || $data['project_id'] < 0) {
        send_json_response(false, 'project_id is Required!');
        return;
    }
}


function database_duplicate_error($wpdb, $duplicateMessage, $defaultErrorMessage = 'Database error')
{
    if ($wpdb->last_error && strpos($wpdb->last_error, 'Duplicate entry') !== false) {
        send_json_response(false, $duplicateMessage);
    } else {
        send_json_response(false, $defaultErrorMessage . ': ' . $wpdb->last_error);
    }
}


function check_required_data($data, $required_fields,)
{
    $required_data = validate_and_sanitize_input($data, $required_fields);
    if (!$required_data) {
        send_json_response(false, 'Required fields are missing.');
        return;
    }
    return $required_data;
}

function transformSvgString($svgString)
{
    $transformedSvg = preg_replace('/\\\\/', '', $svgString); // Remove backslashes
    $transformedSvg = str_replace('&amp;', '&', $transformedSvg); // Unescape HTML entities
    $transformedSvg = preg_replace('/(\s)([a-zA-Z0-9-]+)=""/', '$1$2=""', $transformedSvg); // Fix empty attributes if any
    return $transformedSvg;
}
