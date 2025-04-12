import "./database.js";

import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import qrcode from "qrcode";

import { UserModel } from "./models.js";

export const app = express();

app.use(express.json());

app.post("/api/register", async (req, res) => {
  try{
    const { name , email, password}= req.body;
    
    if (!name) {
      return res.status(400).send({ message: "Name is required!" });
    }

    if (!email) {
      return res.status(400).send({ message: "Email is required!" });
    } 

    if (!password) {    
      return res.status(400).send({ message: "Password is required!" });
    }

    const existingUser =await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).send({ message: "User already exists!" });
    }

    await UserModel.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
    });

    res.send({ message: "User created!" });

  }
  catch(error){
    console.error("Failed to register user", error);
    res.status(500).send({ message: "Failed to register user!" });
   

  }
});

app.post("/api/login", async (req, res) => {
  try{
    const { email, password}= req.body;
    if (!email) {
      return res.status(400).send({ message: "Email is required!" });
    }
    if (!password) {
      return res.status(400).send({ message: "Password is required!" });
    }

    const LoginUser =await UserModel.findOne({ email });
    if (!LoginUser) {
      return res.status(400).send({ message: "Invalid email or password!" });
    }

    await bcrypt.compare(password, LoginUser.password).then((isMatch) => {
      if (!isMatch) {
        return res.status(400).send({ message: "Invalid email or password!" });
      }
    });

    const token =jwt.sign(
      {
        userId: user.id.toString(),
      },
      process.env.JWT_SECRET,
    )
    res.send({
      name: user.name,
      email: user.email,
      token,
    });

  }
  catch(error){
    console.error("Failed to login user", error);
    res.status(500).send({ message: "Failed to login user!" });
    
  }
});

app.use("/api", async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).send({ message: "Unauthorized!" });
  }
 
});

app.get("/api/qrcode", async (req, res) => {
  try {
    if (!req.query.text) {
      return res.send({ message: "Text is required!" });
    }

    const imageUrl = await qrcode.toDataURL(req.query.text, {
      scale: 15,
    });

    res.send({ imageUrl });
  } catch (error) {
    console.error("Failed to generate QR", error);
    res.send({ message: "Failed to generate QR!", error });
  }
});
