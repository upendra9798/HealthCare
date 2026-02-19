import bcrypt from "bcrypt";
const password = await bcrypt.hash("321", 10);
console.log(password);
