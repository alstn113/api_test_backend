const passport = require("passport");

exports.isLoggedIn = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (user) {
      req.user = user;
      next();
    } else {
      const message = encodeURIComponent("로그인이 필요합니다");
      res.status(403).redirect(`/?error=${message}`);
    }
  })(req, res, next);
};

exports.isNotLoggedIn = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user) {
      next();
    } else {
      const message = encodeURIComponent("로그인한 상태입니다");
      res.status(403).redirect(`/?error=${message}`);
    }
  })(req, res, next);
};

exports.noMatter = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};
