const crypto = require("crypto")

const key1 = crypto.randomBytes(16).toString("hex")
const key2 = crypto.randomBytes(16).toString("hex")

console.table({key1: key1, key2: key2})