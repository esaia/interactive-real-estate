<?php

class ShortcodeApi
{


    public function __construct()
    {


        // add_shortcode('fetch_project_data', [$this, 'fetch_project_data']);
    }

    public function fetch_project_data($data)
    {


        $project = new IreProject();
        $floor = new IreFloor();
        $type = new IreType();
        $flat = new IreFlat();

        // Ensure project_id is valid
        $project_id = intval($data['project_id']);


        if ($project_id <= 0) {
            return json_encode(['error' => 'Invalid project ID.']);
        }



        // Fetch project data
        $project->get_projects($data);



        return IreHelper::send_json_response(true, $projects);


        // if (!$project) {
        //     return json_encode(['error' => 'Project not found.']);
        // }


        // Fetch related data
        // $floors = $this->floor_helper->get_floors_by_project($project_id);
        // $types = $this->type_helper->get_types_by_project($project_id);
        // $flats = $this->flat_helper->get_flats_by_project($project_id); // Assuming you have a method for fetching flats

        // Combine all data in the required format
        // $data = [
        //     'project' => $project,
        //     'floors' => $floors,
        //     'flats' => $flats,
        //     'types' => $types,
        // ];

        // Return JSON response
        // return json_encode($data);
    }
}

function ire_get_shortcode_data()
{




    $project = new IreProject();
    $floor = new IreFloor();
    $type = new IreType();
    $flat = new IreFlat();


    $shortcode = new ShortcodeApi();


    $shortcode->fetch_project_data($_POST);
}

add_action('wp_ajax_get_shortcode_data', 'ire_get_shortcode_data');
