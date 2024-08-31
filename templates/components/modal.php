<?php
function render_modal($id, $title, $body)
{
?>
    <!-- Modal -->
    <div class="modal fade" id="<?php echo esc_attr($id); ?>" tabindex="-1" aria-labelledby="<?php echo esc_attr($id); ?>Label" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="<?php echo esc_attr($id); ?>Label"><?php echo esc_html($title); ?></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <?php echo $body; ?>
                </div>

            </div>
        </div>
    </div>
<?php
}
