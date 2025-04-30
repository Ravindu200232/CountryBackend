import User from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import OTP from "../models/otp.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "ravindusubasinha082@gmail.com",
    pass: "mbvi tbqp spgl lmia", // use app password
  },
});

export async function registerUser(req, res) {
  const data = req.body;
  data.password = bcrypt.hashSync(data.password, 10);
  const email = data.email;

  const newUser = new User(data);

  try {
    const checkEmail = await User.findOne({
      email: email,
    });
    if (checkEmail == null) {
      await newUser.save();
      res.json({
        message: "Uses added!",
      });
    } else {
      res.json({
        message: "email is Already use",
      });
    }
  } catch (err) {
    res.json({
      err: "User registration failed",
    });
  }
}

export function loginUser(req, res) {
  const data = req.body;

  User.findOne({
    email: data.email,
  }).then((user) => {
    if (user == null) {
      res.status(404).json({
        error: "User not found",
      });
    } else {
      if (!user.isBlocked) {
        const isPasswordCorrect = bcrypt.compareSync(
          data.password,
          user.password
        );

        if (isPasswordCorrect) {
          const token = jwt.sign(
            {
              username: user.username,
              email: user.email,
              role: user.role,
              image: user.image,
              emailVerified: user.emailVerified,
            },
            process.env.SEKRET_KEY
          );
          res.json({
            message: "Login successfull",
            token: token,
            user: user,
          });
        } else {
          res.status(401).json({
            message: "Login failed",
          });
        }
      } else {
        res.json({
          message: "User is blocked",
        });
      }
    }
  });
}

export function isItAdmin(req) {
  let isAdmin = false;
  if (req.user != null) {
    if (req.user.role == "admin") {
      isAdmin = true;
    }
  }
  return isAdmin;
}

export function isItCustomer(req) {
  let isCustomer = false;
  if (req.user != null) {
    if (req.user.role == "customer") {
      isCustomer = true;
    }
  }
  return isCustomer;
}

export async function getOneUser(req, res) {
  try {
    const id = req.params.id;

    if (req.user == null) {
      res.status(401).json({
        message: "please login",
      });
      return;
    } else {
      const result = await User.findOne({ _id: id });
      if (result == null) {
        res.status(404).json({
          message: "User not found",
        });
        return;
      } else {
        res.json(result);
        return;
      }
    }
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch user",
    });
  }
}

export async function updateUser(req, res) {
  const data = req.body;
  const id = req.params.id;

  try {
    if (req.user == null) {
      res.status(401).json({
        message: "please login",
      });
      return;
    } else {
      await User.updateOne({ _id: id }, data);
      res.json({
        message: "User updated successfully",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Failed to update user",
    });
  }
}

export async function deleteUser(req, res) {
  const id = req.params.id;

  try {
    if (req.user == null) {
      res.status(401).json({
        message: "please login",
      });
      return;
    } else {
      await User.deleteOne({ _id: id });
      res.json({
        message: "User deleted successfully",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete user",
    });
  }
}
export async function changePassword(req, res) {
  const data = req.body;
  const id = req.params.id;

  try {
    if (req.user == null) {
      res.status(401).json({
        message: "please login",
      });
      return;
    } else {
      const user = await User.findOne({ _id: id });
      if (user == null) {
        res.status(404).json({
          message: "User not found",
        });
        return;
      } else {
        const isPasswordCorrect = bcrypt.compareSync(
          data.oldPassword,
          user.password
        );
        if (isPasswordCorrect) {
          const newPassword = bcrypt.hashSync(data.newPassword, 10);
          await User.updateOne(
            { _id: id },
            {
              password: newPassword,
            }
          );
          res.json({
            message: "User password updated successfully",
          });
        } else {
          res.status(401).json({
            message: "Old password is incorrect",
          });
        }
      }
    }
  } catch (err) {
    res.status(500).json({
      message: "Failed to update user password",
    });
  }
}

export async function loginWithGoogle(req, res) {

  const accessToken = req.body.accessToken;

  console.log("hi")

  try {
    
    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(response)


    console.log(response.data);
    const user = await User.findOne({
      email : response.data.email,
    });
    if(user!=null){
      const token = jwt.sign(
        {
          username: user.username,
          email: user.email,
          role: user.role,
          image: user.image,
          phone: user.phone,
        },
        process.env.SEKRET_KEY
      );
      res.json({
        message: "Login successfull",
        token: token,
        user: user,
      });

    }else{
      const newUser = new User({
        email : response.data.email,
        password : "123",
        role : "customer",
        username : response.data.given_name,
        image : response.data.picture,
        emailVerified : true,
      });

      const savedUser = await newUser.save();
      const token = jwt.sign(
        {
          username: savedUser.username,
          email: savedUser.email,
          role: savedUser.role,
          image: savedUser.image,
          phone: savedUser.phone,
          emailVerified: true,
        },
        process.env.SEKRET_KEY
      );
      res.json({
        message: "Login successfull",
        token: token,
        user: savedUser,
      });

    }

    
  } catch (err) {
    res.status(500).json({
      message: "Failed to login with Google",
      error: err.message,
    });
  }
}

export async function sendOTP(req, res) {
  if (req.user == null) {
    res.status(401).json({
      message: "please login and try again",
    });
    return;
  }

  //generete number betwen 1000 and 9999
  const otp = Math.floor(1000 + Math.random() * 9000);
  const newOTP = new OTP({
    email: req.user.email,
    otp: otp,
  });
  await newOTP.save();

  const message = {
    from: "ravindusubasinha082@gmail.com",
    to: req.user.email,
    subject: "OTP for verification",
    text: `Your OTP is ${otp}`,
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        message: "Failed to send OTP",
        error: err.message,
      });
    } else {
      console.log(info);
      res.json({
        message: "OTP sent successfully",
        info: info,
      });
    }
  });
}

export async function verifyOTP(req, res) {
  if (req.user == null) {
    res.status(401).json({
      message: "please login and try again",
    });
    return;
  }
  const data = req.body;
  const email = req.user.email;
  const otp = data.otp;

  try {
    const result = await OTP.findOne({
      otp: otp,
    });
    if (result == null) {
      res.status(401).json({
        message: "OTP is incorrect",
      });
    } else {
      await User.updateOne(
        {
          email: email,
        },
        {
          emailVerified: true,
        }
      );
      await OTP.deleteOne({
        otp: otp,
      });
      res.json({
        message: "OTP verified successfully",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Failed to verify OTP",
    });
  }
}

export async function authentication(req, res) {
  try {
    const email = req.user.email;

    const user = await User.findOne({
      email: email,
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({
      message: "Failed to authenticate user",
    });
  }
}
