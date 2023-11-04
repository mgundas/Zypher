const crypto = require("crypto")

const key1 = crypto.randomBytes(32).toString("hex")
const key2 = crypto.randomBytes(32).toString("hex")

console.table({accesstokensecret: key1, refreshtokensecret: key2})