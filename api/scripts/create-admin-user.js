import * as userService from "../src/services/user.js";
import url from "url";
import inquirer from "inquirer";

const self = url.fileURLToPath(import.meta.url);

const createAdminUser = async (args = {}) => {
  const questions = [
    {
      type: "input",
      message: "Enter the user's email",
      name: "email"
    },
    {
      type: "input",
      message: "Enter a display name",
      name: "displayName"
    },
    {
      type: "password",
      message: "Enter a password (enter at least 6 characters, or hit enter to use a random password)",
      name: "password"
    }
  ];
  const filteredQuestions = questions.filter(q => !args[q.name]);
  const input = await inquirer.prompt(filteredQuestions);
  const response = await userService.createUser({email: input.email || args.email, password: input.password || args.password, displayName: input.displayName || args.displayName, role: "admin", breweries: []});
  const output = { uid: response.uid };
  if (!args.password && !input.password) {
    output.resetLink = await userService.generatePasswordResetLink(args.email || input.email);
    console.log("Password reset link:", output.resetLink);
  }
  return output;
}

if (process.argv[1] === self) {
  const [email, displayName, password] = process.argv.slice(2);
  createAdminUser({email, displayName, password}).then(() => {
    process.exit(0);
  }).catch(error => {
    console.log(error);
    process.exit(1);
  })
}
