import config from "config";
import { v2 as cloudinary } from "cloudinary";
import { log } from "../../utils";
import { CloudinaryConfig } from "../../types";

const { cloudName, cloudApiKey, cloudApiSecret } = config.get<CloudinaryConfig>(
  "providersConfigs.cloudinary"
);

const cloudinaryConnect = () => {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: cloudApiKey,
    api_secret: cloudApiSecret,
  });
};

export const connectCloudinary = () => {
  try {
    cloudinaryConnect();
    log.info(
      `${JSON.stringify({
        action: "Cloudinary Connect",
        message: "Cloudinary connection has been established successfully.",
      })}`
    );
  } catch (error: any) {
    log.error(
      `${JSON.stringify({
        action: "connectCloud Catch",
        messsage: `Cannot connect to the cloudinary: ${error.message}`,
      })}`
    );
  }
};
