import config from "config";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryConfig } from "../src/types";

const { cloudName, cloudApiKey, cloudApiSecret } =
  config.get<CloudinaryConfig>("cloudinaryConfig");

export const cloudinaryConnect = () => {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: cloudApiKey,
    api_secret: cloudApiSecret,
  });
};
