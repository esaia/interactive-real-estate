

    <?php

    include_once plugin_dir_path(IRE_PLUGIN_FILE) . './templates/components/toast.php';



    if (isset($_GET['project'])) {
        include_once plugin_dir_path(IRE_PLUGIN_FILE) . './templates/pages/single-project.php';
    } else {
        include_once plugin_dir_path(IRE_PLUGIN_FILE) . './templates/pages/home.php';
    }

    ?>