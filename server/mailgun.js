require("dotenv").config()
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_SECRET || "2886a1d1d5b7efa807824a83379b840d-2b91eb47-6a451fd4",
  url: "https://api.eu.mailgun.net",
})

module.exports = mg;