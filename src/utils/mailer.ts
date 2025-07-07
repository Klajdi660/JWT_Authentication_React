import fs from "fs";
import path from "path";
import config from "config";
import { createTransport } from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import { SmtpConfigs } from "../types";

const { smtpEmail, smtpPassword, smtpPort, smtpService, smtpHost } =
  config.get<SmtpConfigs>("providersConfigs.smtp");

export const sendEmail = async (
  templatePath: string,
  templateData: Record<string, any>
) => {
  const __dirname = path.resolve();

  const cssPath = path.join(
    __dirname,
    "src",
    "views",
    "css",
    `${templatePath}.css`
  );
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  templateData.inlineCss = cssContent;

  let transporter = createTransport({
    service: smtpService,
    host: smtpHost,
    port: smtpPort,
    secure: false,
    auth: {
      user: smtpEmail,
      pass: smtpPassword,
    },
  });

  const handlebarOptions = {
    viewEngine: {
      extname: ".hbs",
      layoutsDir: path.join(__dirname, "src", "views"),
      defaultLayout: false,
    },
    viewPath: path.join(__dirname, "src", "views"),
    extName: ".hbs",
  };

  transporter.use("compile", hbs(handlebarOptions as any));

  const mailOptions = {
    from: `GrooveIT <${smtpEmail}>`,
    to: "klajdixhafkollari36@gmail.com",
    subject: templateData.title,
    template: templatePath,
    context: templateData,
    attachments: [
      {
        filename: "icon.png",
        path: `${__dirname}/public/assets/icon.png`,
        cid: "icon",
      },
    ],
  };

  return transporter.sendMail(mailOptions);
};
