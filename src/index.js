import "dotenv/config";
import chalk from "chalk";
import { connectDB } from "./config/db.js";
import { closeIO, ask } from "./cli/io.js";
import { welcomeScreen } from "./cli/screens/welcome.js";
import { registerScreen } from "./cli/screens/register.js";
import { loginScreen } from "./cli/screens/login.js";
import { menteeDashboard } from "./cli/screens/menteeDashboard.js";
import { mentorDashboard } from "./cli/screens/mentorDashboard.js";

async function main() {
  try {
    await connectDB();
  } catch (err) {
    console.log(chalk.red(`\nCould not connect to the database: ${err.message}\n`));
    process.exit(1);
  }

  let running = true;
  while (running) {
    const choice = await welcomeScreen();

    if (choice === 1) {
      await registerScreen();
      await ask("\nPress Enter to continue...");
    } else if (choice === 2) {
      const user = await loginScreen();
      if (user) {
        if (user.role === "mentor") {
          await mentorDashboard(user);
        } else {
          await menteeDashboard(user);
        }
      } else {
        await ask("\nPress Enter to continue...");
      }
    } else if (choice === 3) {
      console.log("\nGoodbye!");
      running = false;
    }
  }

  closeIO();
  process.exit(0);
}

main().catch((err) => {
  console.error(chalk.red("\nFatal error:"), err);
  process.exit(1);
});
