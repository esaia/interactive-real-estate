import { ref } from "vue";
import { imageInterface } from "../../types/components";

export function useSelectImage(multiple?: boolean) {
  const selectedImages = ref<imageInterface[] | null>(null);

  const selectImage = () => {
    const mediaFrame = wp.media({
      title: "Select File",
      button: {
        text: "Use this file"
      },
      multiple: multiple ? "add" : false
    });

    mediaFrame.on("select", function () {
      const selection: imageInterface[] = mediaFrame
        .state()
        .get("selection")
        .map((attachment: any) => attachment.toJSON());

      if (multiple) {
        const arr = selection;

        if (selectedImages.value) {
          arr.push(...selectedImages.value);
        }

        selectedImages.value = arr;
      } else {
        selectedImages.value = [selection[0]];
      }
    });

    mediaFrame.open();
  };

  return {
    selectedImages,
    selectImage
  };
}
