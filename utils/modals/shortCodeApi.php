<?php

class ShortcodeApi
{


    public function fetch_project_data($data)
    {


        $project = new IreProject();
        $floor = new IreFloor();
        $flat = new IreFlat();
        $type = new IreType();


        IreHelper::has_project_id($data);




        // Fetch project data
        $projects = $project->get_projects($data);
        $floors = $floor->get_floors($data);
        $flats = $flat->get_flats($data);
        $types = $type->get_types($data);

        $data = [
            'project' => $projects[1],
            'floors' => $floors[1]['data'],
            'flats' => $flats[1]['data'],
            'types' => $types[1]['data'],
        ];


        return IreHelper::send_json_response(true, $data);
    }
}

function ire_get_shortcode_data()
{

    $shortcode = new ShortcodeApi();
    $shortcode->fetch_project_data($_POST);
}

add_action('wp_ajax_get_shortcode_data', 'ire_get_shortcode_data');
