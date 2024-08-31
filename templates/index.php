<?php include_once  IRE_PLUGIN_DIR . 'templates/components/toast.php'; ?>


<div class="container-fluid">
    <div class="d-flex justify-content-between mt-3 ">
        <h3>Add New Project</h3>
        <button type="submit" class="button" data-bs-toggle="modal" data-bs-target="#create-project-modal">Add Project</button>
    </div>


    <?php
    include_once  IRE_PLUGIN_DIR . 'templates/components/modal.php';

    ob_start();
    include IRE_PLUGIN_DIR . 'templates/projects/form.php';
    $modal_body  = ob_get_clean();
    render_modal('create-project-modal', 'My Modal Title', $modal_body);

    include_once  IRE_PLUGIN_DIR . 'templates/projects/getProjects.php';




    ?>






</div>