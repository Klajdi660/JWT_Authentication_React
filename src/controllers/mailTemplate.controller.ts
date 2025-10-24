import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { Request, Response } from "express";

export const getMailTemplate = async (req: Request, res: Response) => {
  const { role, hostname, type } = req.params;

  // Paths
  const hbsPath = path.join(
    __dirname,
    `../templates/${role}/${hostname}/hbs/${type}.hbs`
  );
  const cssPath = path.join(
    __dirname,
    `../templates/${role}/${hostname}/css/${type}.css`
  );

  // Read template & CSS
  const [hbsContent, cssContent] = await Promise.all([
    fs.promises.readFile(hbsPath, "utf8"),
    fs.promises.readFile(cssPath, "utf8").catch(() => ""),
  ]);

  // Compile Handlebars
  const template = Handlebars.compile(hbsContent);

  // Inject CSS into {{{inlineCss}}}
  const html = template({ ...req.query, inlineCss: cssContent });

  // get icon
  const iconPath = path.join(
    __dirname,
    `../templates/${role}/${hostname}/assets/icon.png`
  );
  const attachments = [
    { filename: "icon.png", path: iconPath, cid: "icon" },
  ].filter((a) => fs.existsSync(a.path));

  console.log("attachments :>> ", attachments);

  if (!html) {
    return res.status(404).json({ error: true, message: "Template not found" });
  }

  res.json({ error: false, data: html });
};
