import { ref } from "vue";
import { imageInterface } from "../../types/components";

export function useSelectImage() {
  const selectedImage = ref<imageInterface | null>(null);

  const selectImage = () => {
    const mediaFrame = wp.media({
      title: "Select File",
      button: {
        text: "Use this file"
      },
      multiple: false
    });

    mediaFrame.on("select", function () {
      const selection = mediaFrame.state().get("selection").first().toJSON();
      selectedImage.value = selection;
    });

    mediaFrame.open();
  };

  return {
    selectedImage,
    selectImage
  };
}
