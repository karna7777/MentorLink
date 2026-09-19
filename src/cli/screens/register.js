import { ask, askPassword } from "../io.js";
import { sectionHeader, error, success, printMenu, chooseFromList } from "../ui.js";
import { register, AuthError } from "../../services/authService.js";
import { isValidEmail, isValidPassword } from "../../utils/validators.js";

export async function registerScreen() {
  sectionHeader("REGISTER");

  const name = await ask("Name: ");

  let email;
  while (true) {
    email = await ask("Email: ");
    if (isValidEmail(email)) break;
    error("Please enter a valid email address.");
  }

  let password;
  while (true) {
    password = await askPassword("Password: ");
    if (isValidPassword(password)) break;
    error("Password must be at least 6 characters.");
  }

  console.log();
  console.log("Role:");
  printMenu(["Mentor", "Mentee"]);
  const roleChoice = await chooseFromList("Choose: ", ["Mentor", "Mentee"]);
  const role = roleChoice === 1 ? "mentor" : "mentee";

  try {
    const user = await register({ name, email, password, role });
    success(`\nRegistration successful! You can now log in, ${user.name}.`);
    return user;
  } catch (err) {
    if (err instanceof AuthError) {
      error(`\n${err.message}`);
      return null;
    }
    throw err;
  }
}
