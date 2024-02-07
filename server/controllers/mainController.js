const {
   handleRefreshTokens,
   handleVerifyAccessToken
} = require("./authentication")
const {
   handleLogin,
   handleRegister,
   handleLogout,
} = require("./userActions")
const {
   handleChangelog,
} = require("./notProtected")
const {
   handleDiscover,
   handleChat,
   handleFetchMessages,
   handleProfile,
} = require("./protected")


module.exports = {
   handleLogin,
   handleRegister,
   handleLogout,
   handleVerifyAccessToken,
   handleRefreshTokens,
   handleDiscover,
   handleChat,
   handleFetchMessages,
   handleChangelog,
   handleProfile
};
