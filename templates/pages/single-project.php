<?php


global $wpdb;
$projectId =  $_GET['project'];
$table_name = $wpdb->prefix . 'ire_projects';

$result = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $projectId));
$project_image_src = wp_get_attachment_image_url($result->project_image, 90);
$project_title = $result->title;



?>





<div class=" container-fluid ">

    <div class="relative   pt-[50%]  h-full canvas-container overflow-hidden bg-gray-50">
        <svg id="svgCanvas" class="!absolute top-0 left-0 z-50 " viewBox="0 0 1720 860">
        </svg>
        <img class="absolute top-0 left-0  object-contain  w-full h-full select-none" src="<?php echo $project_image_src ?>" alt="">


        <div id="shapes-sidebar" class="absolute  right-0 w-60 h-full bg-white/80  transition-all duration-200 top-0 z-[51] cursor-default">
            <h4 class="p-3 font-bold border-b">Shapes</h4>

            <div class="shrink-icon group flex absolute right-full top-1/2 cursor-pointer bg-white/80  hover:bg-primary rounded-l-sm  transition-all duration-200 h-fit">
                <span class="dashicons dashicons-admin-collapse text-gray-800 group-hover:text-white  transition-all duration-200 rotate-180 text-sm p-1  w-fit h-fit "></span>
            </div>

            <div class="flex flex-col overflow-y-auto h-full">

                <div class="flex items-center justify-between w-full p-3 cursor-pointer hover:bg-white transition-all duration-200">

                    <p>shape #1</p>

                    <div class="flex items-center">
                        <div class="group  flex items-center justify-center hover:bg-primary transition-all duration-200 border  border-r-0 border-gray-200 first:rounded-l-sm last:rounded-r-sm last:border-r">
                            <span class="dashicons dashicons-trash cursor-pointer text-gray-800 group-hover:text-white text-[10px] w-fit p-1 h-fit transition-all duration-200"></span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    </div>



    <div class="flex items-start mt-3 py-4 justify-between">
        <div class="w-full flex flex-wrap  items-center gap-3 ">

            <div class="flex flex-col gap-5 w-full h-[152px] max-w-64 bg-gray-50 p-3 rounded-sm  ">

                <div>
                    <p class="pb-1 font-bold">Project title:</p>
                    <input type="text" id="project_title" class="w-full " value="<?php echo $project_title ?>" placeholder="Project Title" required>
                </div>

                <div class=" min-w-max bg-gray-50 ">
                    <p class="font-bold"> shortcode:</p>
                    <p> [project_2] </p>
                </div>

            </div>


            <div class="group bg-gray-50 p-3 rounded-sm w-fit">
                <div class="overflow-hidden  rounded-md">
                    <img class="w-full h-20 object-cover group-hover:scale-105 transition-all duration-200 " src="<?php echo $project_image_src ?>" alt="">
                </div>

                <button id="open-media-library" class="bg-gray-200 hover:bg-gray-300 text-gray-900 w-full  py-2 px-4 rounded flex items-center justify-center mt-3">

                    <?php include  IRE_PLUGIN_DIR . 'templates/icons/upload.php'; ?>

                    <p class="ml-3">Upload Project Poligon Image</p>
                </button>



            </div>



            <div class="bg-gray-50 p-3 rounded-sm w-fit">
                <img class="w-full h-20 rounded-md object-cover" src="<?php echo $project_image_src ?>" alt="">
                <button id="open-media-library" class="bg-gray-200 hover:bg-gray-300 text-gray-900 w-full  py-2 px-4 rounded flex items-center justify-center mt-3">

                    <?php include  IRE_PLUGIN_DIR . 'templates/icons/upload.php'; ?>

                    <p class="ml-3">Upload Project Mobile Image</p>
                </button>
            </div>

        </div>


        <div class="flex items-center gap-2 flex-col">
            <button id="updateProject" class="button !px-8">Update</button>
            <button id="updateProject" class="button !px-8">Go Bak</button>
        </div>
    </div>


    <button id="zoomInButton">Zoom In</button>
    <button id="resetZoomButton">Reset Zoom</button>
    <!--     
    <div class="w-56 ">

        <a href="<?php echo PLUGIN_URL; ?>" class="button">Return to projects list</a>
    </div> -->


</div>