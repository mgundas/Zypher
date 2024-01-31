require("dotenv").config();
const jwt = require("jsonwebtoken");
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

const User = require("../Models/UserModel");
const UserSocketMapping = require("../Models/UserSocketMapping");
const TokenRecord = require("../Models/TokenRecord");
const Chat = require("../Models/Chat");

const {
   addToBlacklist,
   isTokenBlacklisted,
} = require("../utils/redisUtils.js");

// Regular expression patterns for fields
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,14}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,16}$/;
// (?=.*[@$!%*?&])

function shuffleArray(array) {
   for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
   }
   return array;
}

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

const handleVerifyAccessToken = async (req, res) => {
   try {
      const accessToken = req.headers.authorization;

      if (!accessToken) {
         console.log(accessToken);
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
      const { accessToken } = req.body

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

      addToBlacklist(refreshToken)
      addToBlacklist(accessToken)

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

      /*       const ipAddress =
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
               uid: findUser._id,
               refreshToken: refreshToken,
               ...reqData
            })
            await record.save(); */

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

const handleDiscover = async (req, res) => {
   try {
      // Convert the size value to Number in case it is not recognized as a number.
      // If size value is not provided, set it to 10 as default.
      const size = Number(req.query.size) || 10;

      // Find all promoted users
      // And exclude the user making the request if they end up in the list
      const promotedUsers = await User.aggregate([
         { $match: { isPromoted: true, isOnline: true, _id: { $ne: req.authUser._id } } },
         { $project: { password: 0, salt: 0 } }
      ]);

      // Calculate the number of promoted users to include
      const numPromotedUsers = Math.min(Math.ceil(size / 2), promotedUsers.length);

      // Sample the required number of promoted users
      const sampledPromotedUsers = numPromotedUsers > 0 ?
         promotedUsers.slice(0, numPromotedUsers) : [];

      // Calculate the number of remaining users to include
      const numRemainingUsers = size - numPromotedUsers;

      // Sample the required number of remaining users 
      // And exclude the user making the request if they end up in the list, again
      const remainingUsers = await User.aggregate([
         { $match: { isOnline: true, _id: { $ne: req.authUser._id } } },
         { $sample: { size: numRemainingUsers } },
         { $project: { password: 0, salt: 0 } }
      ]);

      // Combine the two arrays
      const randomOnlineEntries = [...sampledPromotedUsers, ...remainingUsers];

      // Shuffle the array
      const shuffledEntries = shuffleArray(randomOnlineEntries);

      // TODO: NOT TESTED BECAUSE OF THE ABSENCE OF ENOUGH USERS TO TEST. TEST IT WHEN THERE ARE ENOUGH USERS.
      return res.status(200).json(shuffledEntries)
   } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.log(`Something went wrong in the handleDiscover function: ${err.message}`);
      return res.status(500).json({
         success: false,
         message: "server.error",
      })
   }
}

const handleChat = async (req, res) => {
   try {
      const { username } = req.query;

      const user = await User.findOne(
         { username: username },
         { password: 0, salt: 0 }
      );

      if (!user) {
         return res.status(404).json({
            success: false,
            message: "user.does.not.exist"
         })
      }

      const existingChat = await Chat.findOne({ participants: [user._id, req.authUser._id] })

      if (!existingChat) {
         const newChat = new Chat({
            participants: [user._id, req.authUser._id],
            messages: [],
         });

         await newChat.save();

         return res.status(200).json({
            success: true,
            id: newChat._id
         })
      }

      return res.status(200).json({
         success: true,
         user: user,
         id: existingChat._id
      })

   } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.log(`Something went wrong in the handleChat function: ${err.message}`);
      return res.status(500).json({
         success: false,
         message: "server.error"
      })
   }
}

const handleFetchMessages = async (req, res) => {
   try {
      const { room, size, skip } = req.query

      const skipCount = size * (skip - 1);

      const chat = await Chat.findById(room)
         .select({ messages: { $slice: [skipCount, size] }, _id: 0 });

      if (chat) {
         const reversedMessages = chat.messages.reverse();
         return res.status(200).json({
            success: true,
            messages: reversedMessages
         })
      } else {
         return res.status(404).json({
            success: false,
            message: "chat.not.found"
         })
      }
   } catch (error) {
      console.log("Something went wrong", error.message);
   }
}

module.exports = {
   handleLogin,
   handleRegister,
   handleVerifyAccessToken,
   handleRefreshTokens,
   handleLogout,
   handleDiscover,
   handleChat,
   handleFetchMessages,
};
