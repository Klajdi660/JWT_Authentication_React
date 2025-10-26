import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { Request, Response } from "express";

export const getMailTemplate = async (req: Request, res: Response) => {
  const { role, hostname, type } = req.params;

  const hbsPath = path.join(
    __dirname,
    `../templates/${role}/${hostname}/hbs/${type}.hbs`
  );
  const cssPath = path.join(
    __dirname,
    `../templates/${role}/${hostname}/css/${type}.css`
  );
  const iconPath = path.join(
    __dirname,
    `../templates/${role}/${hostname}/assets/icon.png`
  );

  try {
    // Read template & CSS
    const [hbsContent, inlineCss, iconBuffer] = await Promise.all([
      fs.promises.readFile(hbsPath, "utf8"),
      fs.promises.readFile(cssPath, "utf8").catch(() => ""),
      fs.promises.readFile(iconPath), // Read icon as buffer
    ]);

    // Compile Handlebars
    const template = Handlebars.compile(hbsContent);

    // Convert icon to base64 Data URI
    const iconBase64 = iconBuffer.toString("base64");
    const inlineIcon = `data:image/png;base64,${iconBase64}`;

    // Inject CSS into {{{inlineCss}}}
    // const html = template({ ...req.query, inlineCss: cssContent,  });
    const html = template({ ...req.query, inlineCss, inlineIcon: iconPath });

    console.log("html :>> ", html);

    const filename = path.basename(iconPath); // e.g., "icon.png"
    const cid = filename.replace(/\.[^/.]+$/, ""); // e.g., "icon"

    if (!html || !iconBuffer || !filename || !cid) {
      return res
        .status(404)
        .json({ error: true, message: "Template not found" });
    }

    console.log("iconBuffer :>> ", iconBuffer);

    res.json({
      error: false,
      data: { html, attachments: { filename, icon: iconBuffer, cid } },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Error loading template" });
  }
};
