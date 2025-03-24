<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class ShortcodeApi
 *
 * Handles the fetching of project data, including associated project elements such as floors, blocks, flats, types,
 * meta, and tooltips. This class consolidates all relevant data for a project and returns it in a structured format.
 */
class Irep_Shortcode_Api
{
    /**
     * Fetches all project-related data including floors, blocks, flats, types, meta, and tooltips.
     *
     * @param array $data The request data, which includes the project ID and pagination settings.
     * 
     * @return void Outputs JSON response with the requested project data.
     */
    public function fetch_project_data($data)
    {
        // Check nonce for security and validate the presence of a project ID
        irep_check_nonce($data['nonce'], 'irep_nonce');
        irep_has_project_id($data);
        $data['block'] = 'all';

        // Initialize objects for interacting with different project components (floors, blocks, flats, etc.)
        $project = new Irep_Project();
        $floor = new Irep_Floor();
        $block = new Irep_Block();
        $flat = new Irep_Flat();
        $type = new Irep_Type();
        $meta = new Irep_Meta_Project();
        $tooltip = new Irep_Tooltip();

        // Set a high number for 'per_page' to fetch all related data at once
        $data['per_page'] = 9999;

        // Fetch project data from the respective classes and handle possible null results
        $projects = $project->get_projects($data);
        $projects = ($projects !== null && isset($projects[1])) ? $projects[1] : [];

        $floors = $floor->get_floors($data);
        $floors = ($floors !== null && isset($floors[1]['data'])) ? $floors[1]['data'] : [];

        $blocks = $block->get_block($data);
        $blocks = ($blocks !== null && isset($blocks[1]['data'])) ? $blocks[1]['data'] : [];

        $flats = $flat->get_flats($data);
        $flats = ($flats !== null && isset($flats[1]['data'])) ? $flats[1]['data'] : [];

        $types = $type->get_types($data);
        $types = ($types !== null && isset($types[1]['data'])) ? $types[1]['data'] : [];

        $meta = $meta->get_meta($data);
        $meta = ($meta !== null && isset($meta[1])) ? $meta[1] : [];

        $tooltips = $tooltip->get_tooltip($data);
        $tooltips = ($tooltips !== null && isset($tooltips[1])) ? $tooltips[1]['data'] : [];

        // Prepare a lookup array for types, mapping type ID to its area in square meters
        $types_lookup = [];
        foreach ($types as $type) {
            $types_lookup[$type['id']] = $type['area_m2'];
        }

        // Process floors if data is available
        if (isset($floors[0]) && $floors[0]) {

            // Loop through each floor and process flats matching each floor
            foreach ($floors as &$floor) {
                $floor_number = $floor['floor_number'];
                $polygon_data = $floor['polygon_data'];
                $floor_block_id = $floor['block_id'];

                // Match flats to the current floor based on floor number and polygon data
                if (isset($flats)) {
                    $matching_flats = array_values(array_filter($flats, function ($flat) use ($floor_number, $polygon_data, $floor_block_id) {
                        if ($flat['floor_number'] !== $floor_number) {
                            return false;
                        }

                        if ($polygon_data) {
                            foreach ($polygon_data as $polygon) {
                                if (!is_null($polygon) && isset($polygon['type']) && $polygon['type'] === 'flat' && isset($polygon['id']) && $polygon['id'] === $flat['id']) {
                                    // Check if the flat belongs to the current block
                                    if ($floor_block_id) {
                                        return $flat['block_id'] === $floor_block_id;
                                    } else {
                                        return !$flat['block_id'];  // If no block_id, match any flat without block
                                    }
                                }
                            }
                        }

                        return false; // Default return if no match
                    }));
                }

                // Initialize variables to track minimum price, area, and availability
                $minimum_price = null;
                $minimum_area = null;
                $available = 0;
                $reserved = 0;
                $sold = 0;

                // Loop through the matching flats and calculate statistics (price, area, availability)
                foreach ($matching_flats as $flat) {
                    // Find the flat with the minimum price
                    if (($minimum_price === null || $flat['price'] < $minimum_price) &&  !isset($flat['conf'])) {
                        $minimum_price = $flat['price'];
                    }

                    // Calculate the minimum area based on flat type ID
                    if (!empty($flat['type_id']) && isset($types_lookup[$flat['type_id']])) {
                        if ($minimum_area === null || $types_lookup[$flat['type_id']] < $minimum_area) {
                            $minimum_area = $types_lookup[$flat['type_id']];
                        }
                    } else {
                        if ($minimum_area === null || $flat['type']['area_m2'] < $minimum_area) {
                            $minimum_area = $flat['type']['area_m2'];
                        }
                    }

                    // Count the availability status of each flat
                    switch ($flat['conf']) {
                        case '':
                            $available++;
                            break;
                        case 'reserved':
                            $reserved++;
                            break;
                        case 'sold':
                            $sold++;
                            break;
                    }
                }

                // Prepare count data for the current floor
                $counts = [];
                if ($minimum_price > 0) {
                    $counts['minimum_price'] = $minimum_price;
                }

                if ($minimum_area > 0) {
                    $counts['minimum_area'] = $minimum_area;
                }

                if ($available > 0) {
                    $counts['available'] = $available;
                }
                if ($reserved > 0) {
                    $counts['reserved'] = $reserved;
                }
                if ($sold > 0) {
                    $counts['sold'] = $sold;
                }

                // Add the count data to the floor, if available
                if (!empty($counts)) {
                    $floor['counts'] = $counts;
                } else {
                    $floor['counts'] = null;
                }
            }
        }

        // Clean up the reference to the floor array after processing
        unset($floor);

        // Prepare the final data array that will be sent in the JSON response
        $data = [
            'project' => $projects,
            'floors' => $floors,
            'blocks' => $blocks,
            'flats' => $flats,
            'types' => $types,
            'meta' => $meta,
            'actions' => $tooltips
        ];

        // Send the response back to the client
        irep_send_json_response(true, $data);
    }
}

/**
 * Handles the AJAX request to fetch project data.
 * This function is hooked to 'wp_ajax_' actions for authenticated and unauthenticated users.
 */
function irep_get_shortcode_data()
{
    // Check if the request is valid and contains data
    if (!isset($_POST) || empty($_POST)) {
        irep_send_json_response(false, 'Invalid request');
        return;
    }

    // Create an instance of ShortcodeApi and call the fetch_project_data method
    $shortcode = new Irep_Shortcode_Api();
    $shortcode->fetch_project_data($_POST);
}

// Register the AJAX actions for both authenticated and unauthenticated users
add_action('wp_ajax_nopriv_get_shortcode_data', 'irep_get_shortcode_data');
add_action('wp_ajax_get_shortcode_data', 'irep_get_shortcode_data');
