require("dotenv").config();
const jwt = require("jsonwebtoken");
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

const User = require("../Models/UserModel");
const UserSocketMapping = require("../Models/UserSocketMapping");
const TokenRecord = require("../Models/TokenRecord");
const Changelog = require("../Models/Changelog");
const Chat = require("../Models/Chat");

const {
   handleRefreshTokens,
   handleVerifyAccessToken
} = require("./authentication")

const {
   handleLogin,
   handleRegister,
   handleLogout,
} = require("./userActions")

function shuffleArray(array) {
   for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
   }
   return array;
}

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

const handleChangelog = async (req, res) => {
   try {
      const log = await Changelog.find().sort({ commitCode: -1 });
      const last10Logs = log.slice(0, 10);
      return res.status(200).json({
         success: true,
         changelog: last10Logs,
         more: log.length - 10 < 0 ? 0 : log.length - 10,
      });
   } catch (error) {
      console.log("Something went wrong", error.message);
   }
}

module.exports = {
   handleLogin,
   handleRegister,
   handleLogout,
   handleVerifyAccessToken,
   handleRefreshTokens,
   handleDiscover,
   handleChat,
   handleFetchMessages,
   handleChangelog
};
