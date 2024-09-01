<div class="container">
    <div class="flex w-full items-center  mt-3 justify-between">
        <h3 class="text-2xl">Add New Project</h3>
        <button type="submit" class="button" data-modal-target="create-project">Add Project</button>
    </div>


    <?php
    include_once  IRE_PLUGIN_DIR . 'templates/components/modal.php';

    ob_start();
    include IRE_PLUGIN_DIR . 'templates/projects/form.php';
    $modal_body  = ob_get_clean();
    render_modal('create-project', 'Create Project', $modal_body);

    include_once  IRE_PLUGIN_DIR . 'templates/projects/getProjects.php';

    ?>