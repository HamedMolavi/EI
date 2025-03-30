import dotenv from "dotenv";
import { join } from "path";

export function envConfigs() {
  try {
    dotenv.config({ path: join(__dirname, "../.env"), encoding: 'utf8', debug: false, override: true });
    if (!process.env["SCH_MODE"]) process.env["SCH_MODE"] = "online";
  } catch (err) {
    console.error("Error in reading env file...");
    console.error(err);
    process.exit(1);
  };
};
