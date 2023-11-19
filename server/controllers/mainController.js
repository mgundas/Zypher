require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");
const UserSocketMapping = require("../Models/UserSocketMapping");
const RevokedToken = require("../Models/RevokedToken");
const TokenUserMapping = require("../Models/TokenUserMapping");
const Message = require("../Models/MessageModel");

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
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
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
        { expiresIn: "1h" }
      );
      const refreshToken = jwt.sign(
        { uid: user._id },
        process.env.REFRESHTOKEN_SECRET,
        { expiresIn: "30d" }
      );

      //List the information about the remote user
      /* const ip = req.connection.remoteAddress;
      const browser = req.useragent.browser;
      const os = req.useragent.os;
      const device = req.useragent.isMobile ? "Mobile" : "Desktop";

      const findMapping = await TokenUserMapping.findOne({ uid: user._id });
      if (findMapping) {
        const newLink = await TokenUserMapping.findOneAndUpdate(
          { uid: user._id },
          {
            $addToSet: {
              tokens: {
                accessToken: accessToken,
                refreshToken: refreshToken,
                userAgent: {
                  ip: ip,
                  browser: browser,
                  os: os,
                  device: device,
                },
              },
            },
          },
          { upsert: true, new: true }
        );
        if (newLink) {
          console.log("New access & refreshToken added to the map.");
        }
      } else {
        const newMap = new TokenUserMapping({
          uid: user._id,
          tokens: {
            accessToken: accessToken,
            refreshToken: refreshToken,
            userAgent: {
              ip: ip,
              browser: browser,
              os: os,
              device: device,
            },
          },
        });
        await newMap.save();
      } */

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

    const tokenMap = new TokenUserMapping({
      uid: newUser._id,
    });

    await tokenMap.save();

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

    if (await isTokenRevoked(accessToken)) {
      // Token is revoked, deny access
      console.log("Access denied: Token is revoked.");
      return res.status(200).json({
        success: false,
        message: "access.token.revoked",
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
    const { sender, recipient, limit, skip } = req.query;

    const findSender = await User.findById(sender)
    if(!findSender){
      return res.status(400).json({ error: 'sender.does.not.exist' });
    }

    const findRecipient = await User.findById(recipient)
    if(!findRecipient){
      return res.status(400).json({ error: 'recipient.does.not.exist' });
    }

    const senderId = findSender._id
    const recipientId = findRecipient._id

    const messages = await Message.find({
      $or: [
        { sender: recipientId, recipient: senderId },
        { sender: senderId, recipient: recipientId },
      ],
    })
      .sort({ timestamp: 1 }) // Sort by timestamp in ascending order
      .limit(parseInt(limit))
      .skip(parseInt(skip) * parseInt(limit));

    res.json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const handleFetchRecipient = async (req, res) => {
  try {
    const {recipient} = req.query

    if(!recipient) return res.status(400).json({success: false, message:"recipient.id.not.provided"})

    const findRecipient = await User.findById(recipient)

    if(!findRecipient) return res.status(200).json({success: false, message:"recipient.does.not.exist"})

    res.status(200).json({
      username: findRecipient.username,
      id: findRecipient._id,
      createdAt: findRecipient.createdAt,
      isOnline: findRecipient.isOnline,
    })
  } catch (error) {
    return res.status(500).json({success: false, message:"server.error"})
  }
}

const handleLogout = async (req, res) => {};

module.exports = {
  handleLogin,
  handleRegister,
  handleVerifyAccessToken,
  handleRefreshTokens,
  handleMessage,
  handleFetchRecipient,
  handleLogout,
};
