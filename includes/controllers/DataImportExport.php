<?php

if (!defined('ABSPATH')) {
    exit;
}


class Irep_Import_Export
{


    public function export_data(array $data)
    {

        $data = [
            'nonce'        => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'       => isset($data['action']) ? sanitize_key($data['action']) : '',
            'project_id'   => isset($data['project_id']) ? absint($data['project_id']) : 0,
        ];

        $project_id = $data['project_id'];

        if (!$project_id) {
            irep_send_json_response(false, 'project_id is required');
            return;
        }

        $project = Irep_DB::table("irep_projects")->find($project_id);
        $blocks = Irep_DB::table("irep_blocks")->where('project_id', '=', $project_id)->get();
        $floors = Irep_DB::table("irep_floors")->where('project_id', '=', $project_id)->get();
        $types = Irep_DB::table("irep_types")->where('project_id', '=', $project_id)->get();
        $flats = Irep_DB::table("irep_flats")->where('project_id', '=', $project_id)->get();
        $meta = Irep_DB::table("irep_project_meta")->where('project_id', '=', $project_id)->get();
        $tooltip = Irep_DB::table("irep_tooltip")->where('project_id', '=', $project_id)->get();

        $export_data = [
            'irep_project' => $project,
            'irep_blocks' => $blocks,
            'irep_floors' => $floors,
            'irep_types' => $types,
            'irep_flats' => $flats,
            'irep_project_meta' => $meta,
            'irep_tooltip' => $tooltip,
        ];

        irep_send_json_response(true, $export_data);
    }

    public function import_data(array $data)
    {
        $data = [
            'nonce'      => isset($data['nonce']) ? sanitize_text_field($data['nonce']) : '',
            'action'     => isset($data['action']) ? sanitize_key($data['action']) : '',
            'data'       => $data['data'],
        ];


        $data = $data['data'];

        $project = $data['irep_project'];

        $project = $this->prepare_polygon_svg_data($project, ['svg', 'polygon_data']);

        $project_id = Irep_DB::table('irep_projects')->create($project);
        $id_mapping = [];


        foreach (['irep_blocks', 'irep_floors'] as $table) {
            if (!isset($data[$table])) continue;
            foreach ($data[$table] as $row) {
                if (!isset($row)) return;
                $old_id = $row['id'];
                $row['project_id'] = $project_id;
                $row = $this->prepare_polygon_svg_data($row, ['svg', 'polygon_data']);

                if (isset($row['block_id'])) {
                    $row['block_id'] = strval($id_mapping['irep_blocks'][$row['block_id']]);
                }

                $inserted_id = Irep_DB::table($table)->create($row);
                $id_mapping[$table][$old_id] = $inserted_id;
            }
        }


        foreach ($data['irep_types'] as $row) {
            if (!isset($row)) return;
            $old_id = $row['id'];

            $row['project_id'] = $project_id;
            $row = $this->prepare_polygon_svg_data($row, ['image_2d', 'image_3d']);

            $inserted_id = Irep_DB::table('irep_types')->create($row);
            $id_mapping['irep_types'][$old_id] = $inserted_id;
        }

        foreach ($data['irep_flats'] as $row) {
            if (!isset($row)) return;
            $old_id = $row['id'];
            $row['project_id'] = $project_id;

            if (isset($row['type_id'])) {
                $row['type_id'] = $id_mapping['irep_types'][$row['type_id']];
            }

            if (isset($row['block_id'])) {
                $row['block_id'] = strval($id_mapping['irep_blocks'][$row['block_id']]);
            }

            $row = $this->prepare_polygon_svg_data($row, ['type']);

            $inserted_id = Irep_DB::table('irep_flats')->create($row);
            $id_mapping['irep_flats'][$old_id] = $inserted_id;
        }

        foreach ($data['irep_tooltip'] as $row) {
            if (!isset($row)) return;
            $old_id = $row['id'];
            $row['project_id'] = $project_id;

            $row = $this->prepare_polygon_svg_data($row, ['data']);

            $inserted_id = Irep_DB::table('irep_tooltip')->create($row);
            $id_mapping['irep_tooltip'][$old_id] = $inserted_id;
        }

        foreach ($data['irep_project_meta'] as $row) {
            if (!isset($row)) return;
            $old_id = $row['id'];
            $row['project_id'] = $project_id;

            $row = $this->prepare_polygon_svg_data($row);

            Irep_DB::table('irep_project_meta')->create($row);
        }


        if (isset($project['polygon_data'])) {
            $array = irep_handle_json_data($project['polygon_data']);

            $array = $this->fix_polygon_data($array, $id_mapping);

            $array = irep_handle_json_data($array);

            Irep_DB::table('irep_projects')->where('id', '=', $project_id)
                ->update(['polygon_data' => $array]);
        }



        $blocks = Irep_DB::table("irep_blocks")->where('project_id', '=', $project_id)->get();
        $floors = Irep_DB::table("irep_floors")->where('project_id', '=', $project_id)->get();


        $blocks_floors = [$blocks, $floors];



        foreach ($blocks_floors as  $index => $array) {
            $table = $index === 0 ? 'irep_blocks' : 'irep_floors';

            if (isset($array)) {
                foreach ($array as $item) {
                    $item = (array) $item;

                    $id = $item['id'];
                    $array = $item['polygon_data'];

                    $array = irep_handle_json_data($array);

                    $array = $this->fix_polygon_data($array, $id_mapping);

                    $array = irep_handle_json_data($array);

                    Irep_DB::table($table)->where('id', '=', $id)
                        ->update(['polygon_data' => $array]);
                }
            }
        }


        irep_send_json_response(true, 'success');
    }

    private function prepare_polygon_svg_data($item, $array = [])
    {

        unset($item['id']);
        unset($item['created_at']);
        unset($item['updated_at']);

        foreach ($array as $key) {
            $item[$key] = irep_transformSvgString($item[$key]);
        }

        return $item;
    }



    private function fix_polygon_data($array, $id_mapping)
    {
        foreach ($array as &$item) {
            if ($item['type'] === 'floor') {
                $item['id'] = strval($id_mapping['irep_floors'][$item['id']]);
            } else if ($item['type'] === 'tooltip') {
                $item['id'] = strval($id_mapping['irep_tooltip'][$item['id']]);
            } else if ($item['type'] === 'flat') {
                $item['id'] = strval($id_mapping['irep_flats'][$item['id']]);
            } else if ($item['type'] === 'block') {
                $item['id'] = strval($id_mapping['irep_blocks'][$item['id']]);
            }
        }

        return $array;
    }
}

// Initialize the Irep_Project class.
$irep_import_export = new Irep_Import_Export();

/**
 * AJAX handler function to retrieve all projects.
 */
function irep_export()
{
    global $irep_import_export;
    $irep_import_export->export_data($_POST);
}


function irep_import()
{
    global $irep_import_export;
    $irep_import_export->import_data($_POST);
}

add_action('wp_ajax_irep_export', 'irep_export');
add_action('wp_ajax_irep_import', 'irep_import');
