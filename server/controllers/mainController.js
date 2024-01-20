require("dotenv").config();
const jwt = require("jsonwebtoken");
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

const User = require("../Models/UserModel");
const UserSocketMapping = require("../Models/UserSocketMapping");
const RevokedToken = require("../Models/RevokedToken");
const Message = require("../Models/MessageModel");
const TokenRecord = require("../Models/TokenRecord");

const {
   addToBlacklist,
   isTokenBlacklisted,
} = require("../utils/redisUtils.js");

async function revokeToken(token) {
   try {
      await RevokedToken.create({ token });
      console.log("Token revoked successfully.");
   } catch (error) {
      console.error("Error revoking token:", error);
   }
}

async function isTokenRevoked(token) {
   try {
      const result = await RevokedToken.findOne({ token });
      return !!result; // Returns true if the token is found (revoked), false otherwise
   } catch (error) {
      console.error("Error checking token revocation:", error);
      return true; // Assume an error means the token is revoked for safety
   }
}

// Regular expression patterns for fields
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,14}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,16}$/;
// (?=.*[@$!%*?&])

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
            { expiresIn: "45s" }
         );
         const refreshToken = jwt.sign(
            { uid: user._id },
            process.env.REFRESHTOKEN_SECRET,
            { expiresIn: "60s" }
         );

         const ipAddress =
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
            token: [
               {
                  refreshToken: refreshToken,
                  userAgent: [reqData]
               }
            ]
         })
         await record.save();

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

const handleRegister = async (req, res) => {
   try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
         return res.status(400).json({
            success: false,
            message: "missing.username.email.password",
         });
      }

      if (
         email.trim() === "" ||
         username.trim() === "" ||
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
         email: email,
         password: password,
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

const handleVerifyAccessToken = async (req, res) => {
   try {
      const accessToken = req.headers.authorization;

      if (!accessToken) {
         return res.status(400).json({
            success: false,
            message: "no.access.token.provided",
         });
      }

      const isValid = jwt.verify(accessToken, process.env.ACCESSTOKEN_SECRET);

      if (!isValid) {
         return res.status(200).json({
            success: false,
            message: "access.token.not.valid",
         });
      }

      // Check if the token is blacklisted
      const isBlacklisted = await isTokenBlacklisted(accessToken);

      if (isBlacklisted) {
         return res.status(401).json({
            success: false,
            message: "access.token.blacklisted",
         });
      }

      // console.log("Access token is valid.");

      const uid = jwt.decode(accessToken).uid;
      const findUser = await User.findById(uid);

      if (!findUser) {
         return res.status(200).json({
            success: false,
            message: "user.does.not.exist",
         });
      }

      return res.status(200).json({
         success: true,
         user: {
            id: findUser._id,
            username: findUser.username,
            email: findUser.email,
            createdAt: findUser.createdAt,
         },
      });
   } catch (error) {
      console.log(error);
      if (error.name === "TokenExpiredError") {
         return res.status(200).json({
            success: false,
            message: "access.token.expired",
         });
      } else {
         return res.status(500).json({
            success: false,
            message: "server.error",
         });
      }
   }
};

const handleRefreshTokens = async (req, res) => {
   try {
      const refreshToken = req.headers.authorization;

      if (!refreshToken) {
         return res.status(200).json({
            success: false,
            message: "no.refresh.token.provided",
         });
      }

      const isValid = jwt.verify(refreshToken, process.env.REFRESHTOKEN_SECRET);

      if (!isValid) {
         return res.status(200).json({
            success: false,
            message: "refresh.token.not.valid",
         });
      }

      console.log("Refresh token is valid.");

      // Check if the token is blacklisted
      const isBlacklisted = await isTokenBlacklisted(refreshToken);

      if (isBlacklisted) {
         return res.status(401).json({
            success: false,
            message: "refresh.token.blacklisted",
         });
      }

      const uid = jwt.decode(refreshToken).uid;
      const findUser = await User.findById(uid);

      if (!findUser) {
         return res.status(200).json({
            success: false,
            message: "user.does.not.exist",
         });
      }

      const newAccessToken = jwt.sign(
         { uid: findUser._id },
         process.env.ACCESSTOKEN_SECRET,
         { expiresIn: "1h" }
      );
      const newRefreshToken = jwt.sign(
         { uid: findUser._id },
         process.env.REFRESHTOKEN_SECRET,
         { expiresIn: "30d" }
      );

      return res.status(200).json({
         success: true,
         accessToken: newAccessToken,
         refreshToken: newRefreshToken,
      });
   } catch (error) {
      if (error.name === "TokenExpiredError") {
         return res.status(200).json({
            success: false,
            message: "refresh.token.expired",
         });
      } else {
         return res.status(500).json({
            success: false,
            message: "server.error",
         });
      }
   }
};

const handleMessage = async (req, res) => {
   try {
      const { recipient, limit, skip } = req.query;

      const findRequester = req.authUser

      //  const findRequester = await User.findById(requester);  // Just realized how stupid this piece code was. It literally enables EVERYONE to fetch messages between other people.
      //  if (!findRequester) {
      //    return res.status(400).json({ error: "sender.does.not.exist" });
      //  }

      const findRecipient = await User.findById(recipient);
      if (!findRecipient) {
         return res.status(400).json({ error: "recipient.does.not.exist" });
      }

      const requesterId = findRequester._id;
      const recipientId = findRecipient._id;

      const query = {
         $or: [
            { sender: recipientId, recipient: requesterId },
            { sender: requesterId, recipient: recipientId },
         ],
      }

      const messageList = await Message.find(query)
         .sort({ timestamp: `desc` }) // Sort by timestamp in ascending order
         .limit(parseInt(limit))
         .skip(parseInt(skip) * parseInt(limit));

      const messages = messageList.reverse();

      // Count the number of documents that match the query
      const total = await Message.countDocuments(query);

      const toBeSent = messages.map(message => {
         const { sender, recipient } = message

         let senderUname;
         let recipientUname;


         if (sender.toString() === requesterId.toString() && recipient.toString() === recipientId.toString()) {
            senderUname = findRequester.username
            recipientUname = findRecipient.username
         } else if (sender.toString() === recipientId.toString() && recipient.toString() === requesterId.toString()) {
            senderUname = findRecipient.username
            recipientUname = findRequester.username
         } else {
            console.log("An error occurred.");
         }

         // console.log(message.sender, findRequester._id, message.recipient, findRecipient._id);
         // console.log(senderUname, recipientUname);

         return {
            _id: message._id.toString(),
            recipient: message.recipient.toString(),
            recipientUname: recipientUname,
            senderUname: senderUname,
            sender: message.sender.toString(),
            message: message.message,
            seen: message.seen,
            timestamp: message.timestamp,
         }
      });

      res.json({ messages: toBeSent, total: total });
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
   }
};

const handleFetchRecipient = async (req, res) => {
   try {
      const { recipient } = req.query;

      if (!recipient)
         return res
            .status(400)
            .json({ success: false, message: "recipient.id.not.provided" });

      const findRecipient = await User.findById(recipient);

      if (!findRecipient)
         return res
            .status(200)
            .json({ success: false, message: "recipient.does.not.exist" });

      res.status(200).json({
         username: findRecipient.username,
         id: findRecipient._id,
         createdAt: findRecipient.createdAt,
         isOnline: findRecipient.isOnline,
      });
   } catch (error) {
      return res.status(500).json({ success: false, message: "server.error" });
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
   handleVerifyAccessToken,
   handleRefreshTokens,
   handleMessage,
   handleFetchRecipient,
   handleLogout,
};
