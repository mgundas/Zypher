// Regular expression patterns for fields
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,14}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,16}$/;
// (?=.*[@$!%*?&])

require("dotenv").config();
const jwt = require("jsonwebtoken");
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

const User = require("../../Models/UserModel");
const UserSocketMapping = require("../../Models/UserSocketMapping");
const TokenRecord = require("../../Models/TokenRecord");

const { addToBlacklist } = require("../../utils/redisUtils.js");

const handleRegister = async (req, res) => {
   try {
      const { username, name, email, password } = req.body;

      if (!username || !email || !password || !name) {
         return res.status(400).json({
            success: false,
            message: "missing.username.email.password",
         });
      }

      if (
         email.trim() === "" ||
         username.trim() === "" ||
         name.trim() === "" ||
         password.trim() === ""
      ) {
         return res.status(400).json({
            success: false,
            message: "empty.username.email.password",
         });
      }

      if (
         !email.match(emailRegex) ||
         !username.match(usernameRegex) ||
         !password.match(passwordRegex)
      ) {
         return res.status(400).json({
            success: false,
            message: "invalid.email.username.password.format",
         });
      }

      const existingUser = await User.findOne({
         $or: [{ username: username }, { email: email }],
      });

      if (existingUser) {
         console.log("User with the email exists:", existingUser);
         return res.status(200).json({
            success: false,
            message: "user.exists",
         });
      }

      const newUser = new User({
         username: username,
         profileTitle: name,
         email: email,
         password: password,
         profilePhoto: "",
         bio: "Hey there gorgeous! I'm using Zypher.",
      });

      await newUser.save();

      const newMap = new UserSocketMapping({
         uid: newUser._id,
         sockets: [],
      });

      await newMap.save();

      console.log("User registered:", newUser);
      console.log("New user to socket map registered:", newMap);
      res.status(200).json({
         success: true,
         message: "reg.successful",
      });
   } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false, message: "err.occured" });
   }
};

const handleLogin = async (req, res) => {
   try {
      const { username, password } = req.body;

      if (!username || !password) {
         return res.status(400).json({
            success: false,
            message: "missing.username.password",
         });
      }

      if (username.trim() === "" || password.trim() === "") {
         return res.status(400).json({
            success: false,
            message: "empty.username.password",
         });
      }

      if (!username.match(usernameRegex) || !password.match(passwordRegex)) {
         return res.status(400).json({
            success: false,
            message: "invalid.username.password.format",
         });
      }

      const user = await User.findOne({ username: username });

      if (!user) {
         console.error("user does not exist");
         return res.status(200).json({
            success: false,
            message: "user.does.not.exist",
         });
      }

      user.comparePassword(password, async (err, isMatch) => {
         if (err) {
            console.error("Error:", err);
            return res.status(500).json({
               success: false,
               message: "server.error",
            });
         }

         if (!isMatch) {
            console.error("invalid password");
            return res.status(200).json({
               success: false,
               message: "incorrect.password",
            });
         }

         // Create the json web tokens.
         const accessToken = jwt.sign(
            { uid: user._id },
            process.env.ACCESSTOKEN_SECRET,
            { expiresIn: "30m" }
         );
         const refreshToken = jwt.sign(
            { uid: user._id },
            process.env.REFRESHTOKEN_SECRET,
            { expiresIn: "10d" }
         );

         /*          const ipAddress =
                     req.headers['x-forwarded-for'] || // For reverse proxies
                     req.connection.remoteAddress ||
                     req.socket.remoteAddress ||
                     null;
         
                  const parser = new UAParser();
                  const result = parser.setUA(req.headers["user-agent"]).getResult();
                  var geo = geoip.lookup(ipAddress);
         
                  const reqData = {
                     ip: ipAddress,
                     browser: result.browser.name,
                     os: result.os.name,
                     cpu: result.cpu.architecture,
                     country: geo.country,
                     timezone: geo.timezone,
                     city: geo.city
                  }
         
                  const record = new TokenRecord({
                     uid: user._id,
                     refreshToken: refreshToken,
                     ...reqData
                  })
                  await record.save(); */

         return res.status(200).json({
            success: true,
            username: user.username,
            accessToken: accessToken,
            refreshToken: refreshToken,
         });
      });
   } catch (error) {
      console.error("An error occured.", error);
      res.status(500).json({
         success: false,
         message: "server.error",
      });
   }
};

const handleLogout = async (req, res) => {
   try {
      const { accessToken } = req.body;
      const refreshToken = req.headers.authorization;

      if (!accessToken) {
         return res.status(400).json({
            success: false,
            message: "no.access.token.provided",
         });
      }

      if (!refreshToken) {
         return res.status(400).json({
            success: false,
            message: "no.refresh.token.provided",
         });
      }

      const verifyRefToken = jwt.verify(refreshToken, process.env.REFRESHTOKEN_SECRET)
      const verifyAccToken = jwt.verify(accessToken, process.env.ACCESSTOKEN_SECRET)

      if (!verifyAccToken || !verifyRefToken) {
         return res.status(400).json({
            success: false,
            message: "access.token.or.refresh.token.not.valid",
         });
      }

      try {
         addToBlacklist(refreshToken)
         addToBlacklist(accessToken)

         return res.status(200).json({
            success: true,
            message: "successfully.logged.out",
         });

      } catch (error) {
         console.log(error.message);

         return res.status(500).json({
            success: false,
            message: "server.error",
         });
      }
   } catch (error) {
      console.log(error.message);

      return res.status(500).json({
         success: false,
         message: "server.error",
      });
   }
};

module.exports = {
   handleLogin,
   handleRegister,
   handleLogout,
};