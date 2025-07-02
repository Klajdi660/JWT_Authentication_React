import twilio from "twilio";
import config from "config";
import { log } from "../utils";
import { SMSConfigs } from "../types";
import { MailerSend, SMSParams } from "mailersend";

const { smsAccoutSId, smsAuthToken, smsPhoneNumber, smsApiKey } =
  config.get<SMSConfigs>("providersConfigs.sms");

const client = twilio(smsAccoutSId, smsAuthToken);
const mailerSend = new MailerSend({
  apiKey: smsApiKey,
});

export const sendSms = async (message: string, phoneNumber: string) => {
  //   return client.messages
  //     .create({
  //       body: message,
  //       from: smsPhoneNumber,
  //       to: phoneNumber,
  //     })
  //     .catch((error) => {
  //       log.error(
  //         JSON.stringify({ action: "send_sms_catch", message: error.message })
  //       );
  //     });

  const smsParams = new SMSParams()
    .setFrom("+355693595147")
    .setTo([phoneNumber])
    .setText(message);

  try {
    const response = await mailerSend.sms.send(smsParams);
    console.log("Survey SMS sent successfully:", response);
  } catch (error: any) {
    console.error(
      "Error sending survey SMS:",
      error.response?.data || error.message || error
    );
  }
};
