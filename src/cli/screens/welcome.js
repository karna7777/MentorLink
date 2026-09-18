import { ask } from "../io.js";
import { clearScreen, banner, printMenu, error } from "../ui.js";

export async function welcomeScreen() {
  clearScreen();
  banner();
  printMenu(["Register", "Login", "Exit"]);

  while (true) {
    const raw = await ask("Enter your choice: ");
    const choice = Number(raw);
    if ([1, 2, 3].includes(choice)) return choice;
    error("Please enter 1, 2, or 3.");
  }
}
