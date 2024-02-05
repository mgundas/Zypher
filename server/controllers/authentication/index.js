require("dotenv").config();
const jwt = require("jsonwebtoken");
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');
const User = require("../../Models/UserModel");

const {
   addToBlacklist,
   isTokenBlacklisted,
} = require("../../utils/redisUtils.js");

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

module.exports = {
   handleRefreshTokens,
   handleVerifyAccessToken
}
