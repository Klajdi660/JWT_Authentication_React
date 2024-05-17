import {
  UploadApiOptions,
  //   UploadApiResponse,
  v2 as cloudinary,
} from "cloudinary";
import { log } from "./logger";

export const uploadImgToCloudinary = async (
  file: any,
  folder: string,
  height: number,
  quality: number
) => {
  const options = {
    folder,
    ...(height && { height }),
    ...(quality && { quality }),
    resource_type: "auto",
  };

  const updatedImgToCloudinary = await cloudinary.uploader.upload(
    file.templatePath,
    options as UploadApiOptions
  );
  if (!updatedImgToCloudinary) {
    log.error(
      JSON.stringify({
        action: "updatedImgToCloudinary error",
        message: "Error uploading image to Cloudinary:",
      })
    );
    return { error: true, message: "Error uploading image to Cloudinary" };
  }

  return updatedImgToCloudinary;
};

// interface CloudinaryOptions {
//   folder: string;
//   height?: number;
//   quality?: number;
//   //   resource_type?: "auto" | "image" | "video" | "raw";
//   resource_type?: string;
// }

// export const updatedImgToCloudinary2 = async (
//   file: any,
//   folder: string,
//   height?: number,
//   quality?: number
// ): Promise<UploadApiResponse> => {
//   const options: CloudinaryOptions = { folder };

//   if (height) {
//     options.height = height;
//   }

//   if (quality) {
//     options.quality = quality;
//   }

//   options.resource_type = "auto";

//   return await cloudinary.uploader.upload(
//     file.tempFilePath,
//     options as UploadApiOptions
//   );
// };
