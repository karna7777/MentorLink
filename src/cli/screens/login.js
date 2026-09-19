import { ask, askPassword } from "../io.js";
import { sectionHeader, error, success } from "../ui.js";
import { login, AuthError } from "../../services/authService.js";

export async function loginScreen() {
  sectionHeader("LOGIN");

  const email = await ask("Email: ");
  const password = await askPassword("Password: ");

  try {
    const user = await login({ email, password });
    success("\nLogin successful!");
    console.log(`\nWelcome ${user.name} 👋`);
    return user;
  } catch (err) {
    if (err instanceof AuthError) {
      error(`\n${err.message}`);
      return null;
    }
    throw err;
  }
}
