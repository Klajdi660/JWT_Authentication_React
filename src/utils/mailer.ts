import config from "config";
import path from "path";
import hbs from "nodemailer-express-handlebars";
import { createTransport } from "nodemailer";
import { SmtpConfig } from "../types";

const { smtpEmail, smtpPassword, smtpPort } =
  config.get<SmtpConfig>("smtpConfig");

export const sendEmail = async (templatePath: string, templateData: any) => {
  let transporter = createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: smtpPort,
    secure: false,
    auth: {
      user: smtpEmail,
      pass: smtpPassword,
    },
  });

  const __dirname = path.resolve();

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
    html: "",
    attachments: [
      {
        filename: "icon.png",
        path: `${__dirname}/public/assets/icon.png`,
        cid: "icon",
      },
    ],
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
