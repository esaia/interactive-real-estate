<form id="create-project-form" class="flex flex-col gap-3">

    <div class="form-row">
        <input type="text" id="project_title" class="w-full" placeholder="Project Title" required>

        <button id="open-media-library" class="bg-gray-200 hover:bg-gray-300 text-gray-900 w-full  py-2 px-4 rounded flex items-center justify-center mt-3">

            <?php include_once  IRE_PLUGIN_DIR . 'templates/icons/upload.php'; ?>

            <p class="ml-3">Upload Project Poligon Image</p>
        </button>

    </div>
    <img src="" class="project-thumbnail hidden h-52 object-cover rounded-sm">

    <button type="submit" class="btn btn-light button ">
        Create Project
    </button>
</form>