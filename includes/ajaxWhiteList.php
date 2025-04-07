<?php


/**
 * Whitelist all plugin AJAX actions in Wordfence
 */
add_action('init', 'irep_whitelist_wordfence_ajax_actions');

function irep_whitelist_wordfence_ajax_actions()
{
    // Only run if Wordfence is active
    if (!class_exists('wordfence')) {
        return;
    }

    // List of all AJAX actions to whitelist
    $ajax_actions = [
        // Project
        'irep_get_projects',
        'irep_create_project',
        'irep_update_project',
        'irep_delete_project',
        // Block
        'irep_get_blocks',
        'irep_create_block',
        'irep_update_block',
        'irep_delete_block',
        // DataImportExport
        'irep_export',
        'irep_import',
        // Flat
        'irep_get_flats',
        'irep_create_flat',
        'irep_update_flat',
        'irep_delete_flat',
        // Floor
        'irep_get_floors',
        'irep_create_floor',
        'irep_update_floor',
        'irep_delete_floor',
        // Meta
        'irep_get_meta',
        'irep_create_or_update_meta',
        // ShowtcodeApi
        'irep_get_shortcode_data',
        // Tooltip
        'irep_get_tooltip',
        'irep_create_tooltip',
        'irep_update_tooltip',
        'irep_delete_tooltip',
        // Type
        'irep_get_types',
        'irep_create_type',
        'irep_update_type',
        'irep_delete_type',
    ];

    // Whitelist each action
    foreach ($ajax_actions as $action) {
        if (class_exists('wordfence') && method_exists('wordfence', 'whitelistAjaxAction')) {
            $actions = [
                'irep_get_projects',
                'irep_create_project',
                'irep_update_project',
                'irep_delete_project'
            ];

            foreach ($actions as $action) {
                // wordfence::whitelistAjaxAction($action);
            }
        }
    }
}
