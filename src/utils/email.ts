import nodemailer from "nodemailer";
import config from "config";
import pug from "pug";
import { convert } from "html-to-text";
import { User } from "../models/user.model";
import { log } from "./helpFunctions";
import { SmtpConfigs } from "../types";

const { smtpEmail, smtpPassword, smtpPort } = config.get<SmtpConfigs>(
  "providersConfigs.smtp"
);

export default class Email {
  firstName: string;
  to: string;
  from: string;
  constructor(public user: User, public url: string) {
    // this.firstName = user.name.split(" ")[0];
    this.to = user.email;
    this.from = `Codevo ${smtpEmail}`;
  }

  private newTransport() {
    return nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });
  }

  private async send(template: string, subject: string) {
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstName: this.firstName,
      subject,
      url: this.url,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: convert(html),
      html,
    };

    const info = await this.newTransport().sendMail(mailOptions);
    log.info(nodemailer.getTestMessageUrl(info));
  }

  async sendVerificationCode() {
    await this.send("verificationCode", "Your account verification code");
  }

  async sendPasswordResetToken() {
    await this.send(
      "resetPassword",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
}
