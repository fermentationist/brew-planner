// Purpose: script to deploy database
import dotenv from "dotenv";
import fs from "fs";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import scriptList from "./scriptList.js";
import dbInit from "../../../api/src/services/db/lib/index.js";
dotenv.config();

const self = fileURLToPath(import.meta.url);
const dirName = dirname(self);

const LIVE_DB_CREDENTIALS = {
  database: process.env.LIVE_DB_NAME,
  user: process.env.LIVE_DB_USER,
  host: process.env.LIVE_DB_HOST,
  password: process.env.LIVE_DB_PASS
}
const STAGE_DB_CREDENTIALS = {
  database: process.env.STAGE_DB_NAME,
  user: process.env.STAGE_DB_USER,
  host: process.env.STAGE_DB_HOST,
  password: process.env.STAGE_DB_PASS
}

const deploy = async liveOrStage => {
  const mode = (liveOrStage || "").toLowerCase() || "stage";
  const credentials = mode === "live" ? LIVE_DB_CREDENTIALS : STAGE_DB_CREDENTIALS;
  const db = dbInit(credentials);
  const runScripts = async (scriptNames, relativePath) => {
    for (const script of scriptNames) {
      const scriptPath = path.resolve(dirName, `${relativePath}/${script}`);
      const query = fs.readFileSync(scriptPath, "utf8");
      if (query) {
        console.log("running sql script:", scriptPath);
        await db.queryProm(query);
      }
    }
  }
  console.log("running primary table creation scripts")
  await runScripts(scriptList, "../../sql"); // run main table creation scripts

  const allUpdates = fs.readdirSync(path.resolve(dirName, "../../sql/update"), "utf8");
  let updateLog = [];
  try {
    updateLog = (fs.readFileSync(path.resolve(dirName, "../../logs/update_log.txt"), "utf8")).split(",");
  } catch (error) {
    console.log("no update log found");
  } finally {
    const updateList = allUpdates.filter(update => !updateLog.includes(update));
    const sortedUpdates = updateList.sort(); // if update names all begin with timestamps, this should sort them chronologically
    console.log("running update scripts");
    await runScripts(sortedUpdates, "../../sql/update"); // run update scripts
    if (mode === "live") {
      const newLog = [
        ...updateLog,
        ...sortedUpdates
      ];
      fs.writeFileSync(path.resolve(dirName, "../../logs/update_log.txt"), newLog.join(","));
    }
  }
}

if (process.argv[1] === self) {
  const [liveOrStage] = process.argv.slice(2);
  deploy(liveOrStage).then(() => {
    console.log("done deploying database");
    process.exit(0);
  }).catch(error => {
    console.error("error deploying database:");
    console.error(error);
    process.exit(1);
  })
}
