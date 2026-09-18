import chalk from "chalk";
import { ask } from "./io.js";

export function clearScreen() {
  console.clear();
}

export function banner() {
  console.log(chalk.cyan("╔══════════════════════════════════════╗"));
  console.log(chalk.cyan("║") + chalk.bold.white("             MENTORLINK                ") + chalk.cyan("║"));
  console.log(chalk.cyan("║") + chalk.gray("   Mentorship & Career Guidance        ") + chalk.cyan("║"));
  console.log(chalk.cyan("╚══════════════════════════════════════╝"));
  console.log();
}

export function sectionHeader(title) {
  const padded = ` ${title} `;
  const bar = "=".repeat(10);
  console.log();
  console.log(chalk.bold.cyan(`${bar}${padded}${bar}`));
  console.log();
}

export function success(message) {
  console.log(chalk.green(message));
}

export function error(message) {
  console.log(chalk.red(message));
}

export function info(message) {
  console.log(chalk.gray(message));
}

export function printMenu(options) {
  options.forEach((option, index) => {
    console.log(`${index + 1}. ${option}`);
  });
  console.log();
}

export async function pressEnterToContinue() {
  await ask(chalk.gray("\nPress Enter to continue..."));
}

export async function chooseFromList(question, choices) {
  while (true) {
    const raw = await ask(question);
    const num = Number(raw);
    if (Number.isInteger(num) && num >= 1 && num <= choices.length) {
      return num;
    }
    error(`Please enter a number between 1 and ${choices.length}.`);
  }
}
