<?php

function ire_check_nonce(string | null $nonce, string $action)
{

    if (!(isset($nonce) && wp_verify_nonce($nonce, $action))) {
        wp_send_json_error('Invalid nonce');
        exit;
    }
}
