import { v2 as cloudinary } from "cloudinary";

interface CloudinaruOptions {
  file?: any;
  folder?: string;
  height?: number;
  quality?: number;
  resourceType?: string;
}

export const uploadImageToCloudinary = async (
  file: any,
  folder: string,
  height: number,
  quality: number
) => {
  const options: CloudinaruOptions = { folder };

  if (height) {
    options.height = height;
  }

  if (quality) {
    options.quality = quality;
  }

  options.resourceType = "auto";

  const updateToCloudinary = await cloudinary.uploader.upload(
    file.tempFilePath,
    options
  );

  return updateToCloudinary;
};

// import {
//   UploadApiOptions,
//   //   UploadApiResponse,
//   v2 as cloudinary,
// } from "cloudinary";
// import { log } from "./helpFunctions";

// export const uploadImgToCloudinary = async (
//   file: any,
//   folder: string,
//   height: number,
//   quality: number
// ) => {
//   const options = {
//     folder,
//     ...(height && { height }),
//     ...(quality && { quality }),
//     resource_type: "auto",
//   };

//   const updatedImgToCloudinary = await cloudinary.uploader.upload(
//     file.templatePath,
//     options as UploadApiOptions
//   );
//   if (!updatedImgToCloudinary) {
//     log.error(
//       JSON.stringify({
//         action: "updatedImgToCloudinary error",
//         message: "Error uploading image to Cloudinary:",
//       })
//     );
//     return { error: true, message: "Error uploading image to Cloudinary" };
//   }

//   return updatedImgToCloudinary;
// };
