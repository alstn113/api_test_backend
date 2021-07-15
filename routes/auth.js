const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/user");

const router = express.Router();

//회원가입은 동일
router.post("/register", async (req, res, next) => {
  const { email, password, nick } = req.body;
  try {
    const exUser = await User.findOne({ where: { email: email } });
    if (exUser) {
      return res.json({
        status: 409,
      });
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.json({ status: 200 });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.json({ status: 401 });
    }
    return req.login(user, { session: false }, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return res.json({ status: 401 });
      }
      const access_token = jwt.sign({ id: user.id, email: user.email, nick: user.nick }, process.env.JWT_SECRET, { expiresIn: "10m" });
      const refresh_token = jwt.sign({ id: user.id, email: user.email, nick: user.nick }, process.env.JWT_SECRET, { expiresIn: "7d" });
      return res.json({ status: 200, access_token: access_token, refresh_token: refresh_token });
    });
  })(req, res, next);
});

module.exports = router;
