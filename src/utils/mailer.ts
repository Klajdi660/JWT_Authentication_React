import config from "config";
import path from "path";
import hbs from "nodemailer-express-handlebars";
import { createTransport } from "nodemailer";
import { SmtpConfig } from "../types";

const smtp = config.get<SmtpConfig>("smtp");

export const sendEmail = (templatePath: string, templateData: any) => {
  let transporter = createTransport({
    ...smtp,
    auth: {
      user: smtp.email,
      pass: smtp.password,
    },
  });

  const __dirname = path.resolve();

  const handlebarOptions = {
    viewEngine: {
      extname: ".hbs",
      layoutsDir: path.join(__dirname, "src", "public", "views"),
      defaultLayout: false,
    },
    viewPath: path.join(__dirname, "src", "public", "views"),
    extName: ".hbs",
  };

  transporter.use("compile", hbs(handlebarOptions as any));

  const mailOptions = {
    from: `GrooveIT <${smtp.email}>`,
    to: "klajdixhafkollari36@gmail.com",
    subject: templateData.title,
    template: templatePath,
    context: templateData,
    html: "",
    attachments: [
      {
        filename: "icon.png",
        path: `${__dirname}/src/public/assets/icon.png`,
        cid: "icon",
      },
    ],
  };

  const info = transporter.sendMail(mailOptions);
  return info;
};
