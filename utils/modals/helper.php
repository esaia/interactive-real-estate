<?php

class IreHelper
{



    public static function check_nonce(?string $nonce, string $action): void
    {
        if (!(isset($nonce) && wp_verify_nonce($nonce, $action))) {
            wp_send_json_error('Invalid nonce');
            exit;
        }
    }

    public static function send_json_response(bool $success, $message): void
    {
        if ($success) {
            wp_send_json_success($message);
        } else {
            wp_send_json_error($message);
        }
    }

    public static function handle_json_data($data)
    {
        return is_array($data) ? json_encode($data) : json_decode($data);
    }

    public static function validate_and_sanitize_input(array $data, array $keys, bool $required = true): ?array
    {
        $sanitized_data = [];
        foreach ($keys as $key) {
            if (isset($data[$key]) && !empty($data[$key])) {
                $sanitized_data[$key] = sanitize_text_field($data[$key]);
            } elseif ($required) {
                return null; // Return null if required fields are missing
            }
        }
        return $sanitized_data;
    }

    public static function dd($data): void
    {
        error_log(print_r($data, true));
        die();
    }

    public static function get_image_instance(int $image_id): ?array
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
    }


    public static  function sanitize_sorting_parameters(array $data, array $allowedSortFields)
    {
        // Define allowed sort fields and orders

        $allowedSortOrders = ['ASC', 'DESC'];

        // Sanitize sort field
        $data['sort_field'] = isset($data['sort_field']) && in_array($data['sort_field'], $allowedSortFields)
            ? $data['sort_field']
            : 'id';

        // Sanitize sort order
        $data['sort_order'] = isset($data['sort_order']) && in_array($data['sort_order'], $allowedSortOrders)
            ? $data['sort_order']
            : 'ASC';

        // Sanitize page number
        $data['page'] = isset($data['page']) ? intval($data['page']) : 1;
        $data['per_page'] = isset($data['per_page']) ? intval($data['per_page']) : 8;
        return $data;
    }


    public static function get($table_name, $id)
    {
        global $wpdb;

        // Sanitize the table name
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $table_name)) {
            return null; // or throw an exception
        }

        // Prepare and execute the query
        return $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table_name} WHERE id = %d", intval($id)));
    }

    public static function has_project_id(array $data)
    {


        $data = IreHelper::validate_and_sanitize_input($data, ['project_id']);

        if (!$data) {
            IreHelper::send_json_response(false, 'project_id is Required!');
            return;
        }
    }
}
