<?php

function ire_check_nonce(string | null $nonce, string $action)
{

    if (!(isset($nonce) && wp_verify_nonce($nonce, $action))) {
        wp_send_json_error('Invalid nonce');
        exit;
    }
}


function send_json_response($success, $message)
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

function validate_and_sanitize_input($data, $keys, $required = true)
{
    $sanitized_data = [];
    foreach ($keys as $key) {
        if (isset($data[$key])) {
            $sanitized_data[$key] = sanitize_text_field($data[$key]);
        } elseif ($required) {
            return false; // Return false if required fields are missing
        }
    }
    return $sanitized_data;
}

function dd($data)
{

    error_log(print_r($data, true));
    die();
}


function get_image_instance($image_id)
{
    // Get the attachment post object
    $image_post = get_post($image_id);

    if (!$image_post) {
        return null; // Return null if no image found
    }

    // Get image metadata
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

    // Additional data
    $filesize = filesize(get_attached_file($image_id));
    $filesize_human = size_format($filesize);
    $image_sizes = wp_get_attachment_metadata($image_id)['sizes'] ?? [];

    // Create the interface object
    $image_instance = [
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
        'type' => 'image', // Assuming it's always an image
        'subtype' => strtolower(str_replace('image/', '', $image_mime)),
        'icon' => wp_mime_type_icon($image_mime),
        'dateFormatted' => get_the_date('', $image_post),
        'nonces' => [], // You can add nonce values if needed
        'editLink' => get_edit_post_link($image_id),
        'meta' => true,
        'authorName' => get_the_author_meta('display_name', $image_author_id),
        'authorLink' => get_author_posts_url($image_author_id),
        'filesizeInBytes' => $filesize,
        'filesizeHumanReadable' => $filesize_human,
        'context' => '', // Set context if needed
        'originalImageURL' => $image_url,
        'originalImageName' => $image_filename,
        'height' => $image_meta['height'] ?? 0,
        'width' => $image_meta['width'] ?? 0,
        'orientation' => ($image_meta['height'] > $image_meta['width']) ? 'portrait' : 'landscape',
        'sizes' => $image_sizes,
        'compat' => [], // Set compatibility data if needed
    ];

    return $image_instance;
}
