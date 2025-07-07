import twilio from "twilio";
import config from "config";
// import { MailerSend, SMSParams } from "mailersend";
import { log } from "../utils";
import { SMSConfigs } from "../types";

const { smsAccoutSId, smsAuthToken, smsPhoneNumber, smsApiKey, smsFrom } =
  config.get<SMSConfigs>("providersConfigs.sms");

const client = twilio(smsAccoutSId, smsAuthToken);
// const mailerSend = new MailerSend({
//   apiKey: smsApiKey,
// });

export const sendSms = async (message: string, phoneNumber: string) => {
  return client.messages
    .create({
      body: message,
      from: smsPhoneNumber,
      to: phoneNumber,
    })
    .catch((error) => {
      log.error(
        JSON.stringify({ action: "send_sms_catch", message: error.message })
      );
    });
  //   try {
  //     const smsParams = new SMSParams()
  //       .setFrom(smsFrom)
  //       .setTo([phoneNumber])
  //       .setText(message);
  //     return mailerSend.sms.send(smsParams);
  //   } catch (error: any) {
  //     log.error(
  //       JSON.stringify({
  //         action: "send_sms_catch",
  //         message: error.response?.data || error.message || error,
  //       })
  //     );
  //   }
};
