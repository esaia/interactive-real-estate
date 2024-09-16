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


function validate_and_sanitize_input($data, $required_keys)
{
    $sanitized_data = [];
    foreach ($required_keys as $key) {
        if (isset($data[$key])) {
            $sanitized_data[$key] = sanitize_text_field($data[$key]);
        } else {
            return false;
        }
    }
    return $sanitized_data;
}


function dd($data)
{

    error_log(print_r($data, true));
    die();
}
