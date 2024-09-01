<?php
function render_modal($id, $title, $body)
{
?>
    <div id="<?php echo esc_attr($id); ?>" class="modal hidden opacity-0 transition-all duration-500 fixed inset-0 z-[10000]   bg-black bg-opacity-50 overflow-auto w-full h-full">
        <div class="relative top-1/4 mx-auto p-5 border w-11/12 lg:w-1/3 bg-white rounded">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold"><?php echo esc_html($title); ?></h2>
                <button class="close-modal text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div class="mt-4">

                <?php echo $body; ?>
            </div>
        </div>
    </div>

<?php
}
