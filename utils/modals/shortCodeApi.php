<?php

class ShortcodeApi
{


    public function fetch_project_data($data)
    {

        check_nonce($data['nonce'], 'ire_nonce');

        $project = new IreProject();
        $floor = new IreFloor();
        $block = new IreBlock();
        $flat = new IreFlat();
        $type = new IreType();
        $meta = new IreMetaProject();
        $tooltip = new IreTooltip();

        has_project_id($data);

        $data['per_page'] = 9999;

        // Fetch project data
        $projects = $project->get_projects($data)[1];
        $floors = $floor->get_floors($data)[1]['data'];
        $blocks = $block->get_block($data)[1]['data'];
        $flats = $flat->get_flats($data)[1]['data'];
        $types = $type->get_types($data)[1]['data'];
        $meta = $meta->get_meta($data)[1];
        $tooltips = $tooltip->get_tooltip($data)[1];

        $types_lookup = [];

        foreach ($types as $type) {
            $types_lookup[$type['id']] = $type['area_m2'];
        }


        if (isset($floors[0]) && $floors[0]) {

            foreach ($floors as &$floor) {
                $floor_number = $floor['floor_number'];
                $polygon_data = $floor['polygon_data'];
                $floor_block_id = $floor['block_id'];



                $matching_flats = array_values(array_filter($flats, function ($flat) use ($floor_number, $polygon_data, $floor_block_id) {
                    if ($flat['floor_number'] !== $floor_number) {
                        return false;
                    }

                    if ($polygon_data) {
                        foreach ($polygon_data as $polygon) {

                            if (!is_null($polygon) && isset($polygon['type']) && $polygon['type'] === 'flat' && isset($polygon['id']) && $polygon['id'] === $flat['id']) {
                                if ($floor_block_id) {
                                    return $flat['block_id'] === $floor_block_id;
                                } else {
                                    return !$flat['block_id'];
                                }
                            }
                        }
                    }

                    return false;
                }));



                $minimum_price = null;
                $minimum_area = null;
                $available = 0;
                $reserved = 0;
                $sold = 0;


                foreach ($matching_flats as $flat) {

                    if ($minimum_price === null || $flat['price'] < $minimum_price) {
                        $minimum_price = $flat['price'];
                    }

                    if ($minimum_area === null || $types_lookup[$flat['type_id']] < $minimum_area) {
                        $minimum_area = $types_lookup[$flat['type_id']];
                    }

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



                if (!empty($counts)) {
                    $floor['counts'] = $counts;
                } else {
                    $floor['counts'] = null;
                }



                // $floor['flats'] = $matching_flats;
            }
        }


        unset($floor);

        $data = [
            'project' => $projects,
            'floors' => $floors,
            'blocks' => $blocks,
            'flats' => $flats,
            'types' => $types,
            'meta' => $meta,
            'actions' => $tooltips
        ];

        send_json_response(true, $data);
    }
}

function ire_get_shortcode_data()
{
    if (!isset($_POST) || empty($_POST)) {
        send_json_response(false, 'Invalid request');
        return;
    }

    $shortcode = new ShortcodeApi();
    $shortcode->fetch_project_data($_POST);
}

add_action('wp_ajax_nopriv_get_shortcode_data', 'ire_get_shortcode_data');
add_action('wp_ajax_get_shortcode_data', 'ire_get_shortcode_data'); // remove after production
