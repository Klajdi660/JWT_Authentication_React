import twilio from "twilio";
import config from "config";
import { log } from "../utils";
import { SMSConfigs } from "../types";

const { smsAccoutSId, smsAuthToken, smsPhoneNumber } = config.get<SMSConfigs>(
  "providersConfigs.sms"
);

const client = twilio(smsAccoutSId, smsAuthToken);

export const sendSms = async (message: string, phoneNumber: string) => {
  return client.messages
    .create({
      body: message,
      from: "+18562635060", // smsPhoneNumber
      to: phoneNumber,
    })
    .catch((error) => {
      log.error(
        JSON.stringify({ action: "send_sms_catch", message: error.message })
      );
    });
};
