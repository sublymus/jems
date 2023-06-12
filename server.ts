import "./squeryconfig";

import cors from "cors";
import express from "express";
import path from "path";
import Log from "sublymus_logger";
import { SQuery } from "./lib/squery/SQuery";

const PORT = 3001;

const app = express();
const server = app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});

app.use(cors());

app.get("/test", (req, res) => {
  res.redirect("/test.html");
});
app.get("/", (req, res) => {
  res.redirect("/test.html");
});
app.get("/create", async(req, res) => {
  const data = await SQuery.service('server','description',{modelPath:'account'});
  res.send(data);

});

app.get("*", async (req, res) => {
  if (req.path.startsWith("/fs")) {
    try {
      const urlData = await SQuery.files.accessValidator(req.url, req.cookies);
      if (!urlData) return res.status(404).send("File Not Found");
      return res.sendFile(path.join(__dirname, urlData.realPath));
    } catch (error) {
      Log("FILE_ACCESS_ERROR", error);
      return res.status(404).send("File Not Found");
    }
  }
  const filePath = path.join(__dirname, "Public/views", req.path);
  res.sendFile(filePath);
});
const io = SQuery.io(server);
