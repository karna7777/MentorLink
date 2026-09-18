import readline from "node:readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const CODE_ENTER = [10, 13]; // \n, \r
const CODE_CTRL_C = 3;
const CODE_BACKSPACE = [8, 127];

export function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

// Masks input with '*' when running in a real terminal; falls back to a
// plain (unmasked) read when stdin isn't a TTY (e.g. piped input in tests).
export function askPassword(question) {
  if (!process.stdin.isTTY) {
    return ask(question);
  }

  return new Promise((resolve) => {
    process.stdout.write(question);
    let password = "";

    rl.pause();
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    const onData = (char) => {
      const code = char.charCodeAt(0);

      if (CODE_ENTER.includes(code)) {
        process.stdin.setRawMode(false);
        process.stdin.removeListener("data", onData);
        process.stdin.pause();
        rl.resume();
        process.stdout.write("\n");
        resolve(password.trim());
        return;
      }

      if (code === CODE_CTRL_C) {
        process.stdout.write("\n");
        closeIO();
        process.exit(0);
      }

      if (CODE_BACKSPACE.includes(code)) {
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write("\b \b");
        }
        return;
      }

      password += char;
      process.stdout.write("*");
    };

    process.stdin.on("data", onData);
  });
}

export async function askNumber(question, { min, max } = {}) {
  while (true) {
    const raw = await ask(question);
    const num = Number(raw);
    const inRange = (min === undefined || num >= min) && (max === undefined || num <= max);
    if (Number.isInteger(num) && inRange) {
      return num;
    }
    console.log(
      "Please enter a valid number" + (min !== undefined ? ` between ${min} and ${max}` : "") + "."
    );
  }
}

export function closeIO() {
  rl.close();
}
