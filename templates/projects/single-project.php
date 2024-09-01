<?php



global $wpdb;
$projectId =  $_GET['project'];
$table_name = $wpdb->prefix . 'ire_projects';



$result = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $projectId));




$project_image_src = wp_get_attachment_image_url($result->project_image, 90);




?>


<div class=" container-fluid">

    <div class="relative   pt-[50%]  h-full canvas-container overflow-hidden">
        <svg id="svgCanvas" class="!absolute top-0 left-0 z-50 " viewBox="0 0 1720 860">


        </svg>

        <img class="absolute top-0 left-0  object-contain    w-full h-full" src="<?php echo $project_image_src ?>" alt="">
    </div>
    <!-- 
    <div class="w-56 ">

        <a href="<?php echo PLUGIN_URL; ?>" class="button">Return to projects list</a>
    </div> -->


</div>