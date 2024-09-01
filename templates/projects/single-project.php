<?php



global $wpdb;
$projectId =  $_GET['project'];
$table_name = $wpdb->prefix . 'ire_projects';



$result = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $projectId));




$project_image_src = wp_get_attachment_image_url($result->project_image, 90);




?>


<div class="flex container-fluid">

    <div class="flex-1 relative   pt-[70%]">
        <img class="absolute top-0 left-0  object-cover w-full h-full" src="<?php echo $project_image_src ?>" alt="">


        <svg id="svgCanvas" class="!absolute top-0 left-0 w-full h-full bg-red-300/20" viewBox="0 0 1069 601">
        </svg>
    </div>

    <div class="w-56 ">

        <a href="<?php echo PLUGIN_URL; ?>" class="button">Return to projects list</a>
    </div>


</div>