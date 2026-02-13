const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const fs = require("fs-extra");
const session = require("express-session");
const eta = require("eta");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const Passport = require("passport");
const bcrypt = require("bcrypt");
const mimeDB = require("mime-db");
const http = require("http");
const server = http.createServer(app);
const path = require("path");

module.exports = async (api) => {

  if (!api)
    await require("./connectDB.js")();

  const { utils } = global;
  const { config } = global.GoatBot;
  const { expireVerifyCode } = config.dashBoard;
  const getText = global.utils.getText;

  const {
    threadsData,
    usersData,
    dashBoardData
  } = global.db;

  // ================= VIEW ENGINE =================

  eta.configure({ useWith: true });

  app.set("views", `${__dirname}/views`);
  app.engine("eta", eta.renderFile);
  app.set("view engine", "eta");

  // ================= MIDDLEWARE =================

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(session({
    secret: process.env.SESSION_SECRET || "shourov_super_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  }));

  app.use("/css", express.static(`${__dirname}/css`));
  app.use("/js", express.static(`${__dirname}/js`));
  app.use("/images", express.static(`${__dirname}/images`));
  app.use(express.static(path.join(__dirname, "public")));

  require("./passport-config.js")(Passport, dashBoardData, bcrypt);
  app.use(Passport.initialize());
  app.use(Passport.session());
  app.use(fileUpload());
  app.use(flash());

  app.use((req, res, next) => {
    res.locals.success = req.flash("success") || [];
    res.locals.errors = req.flash("errors") || [];
    res.locals.user = req.user || null;
    next();
  });

  // ================= LIMITER =================

  const createLimiter = (ms, max) => rateLimit({
    windowMs: ms,
    max
  });

  // ================= THREAD CHECK =================

  async function checkAuthConfigDashboardOfThread(threadData, userID) {
    if (!isNaN(threadData))
      threadData = await threadsData.get(threadData);
    return threadData?.adminIDs?.includes(userID) || false;
  }

  const middleWare = require("./middleware/index.js")(checkAuthConfigDashboardOfThread);

  const {
    unAuthenticated,
    isWaitVerifyAccount,
    isAuthenticated,
    isAdmin,
    isVeryfiUserIDFacebook,
    checkHasAndInThread,
    middlewareCheckAuthConfigDashboardOfThread
  } = middleWare;

  // ================= RECAPTCHA =================

  const verifyRecaptcha = require("./utils/verifyRecaptcha");

  // ================= ROUTE PARAMS =================

  const paramsForRoutes = {
    unAuthenticated,
    isWaitVerifyAccount,
    isAdmin,
    isAuthenticated,
    isVeryfiUserIDFacebook,
    checkHasAndInThread,
    middlewareCheckAuthConfigDashboardOfThread,
    dashBoardData,
    expireVerifyCode,
    Passport,
    threadsData,
    usersData,
    api,
    createLimiter,
    config,
    checkAuthConfigDashboardOfThread,
    isVerifyRecaptcha: verifyRecaptcha
  };

  // ================= ROUTES =================

  app.use("/register", require("./routes/register.js")(paramsForRoutes));
  app.use("/login", require("./routes/login.js")(paramsForRoutes));
  app.use("/forgot-password", require("./routes/forgotPassword.js")(paramsForRoutes));
  app.use("/change-password", require("./routes/changePassword.js")(paramsForRoutes));
  app.use("/dashboard", require("./routes/dashBoard.js")(paramsForRoutes));
  app.use("/verifyfbid", require("./routes/verifyfbid.js")(paramsForRoutes));
  app.use("/api", require("./routes/api.js")(paramsForRoutes));

  // ================= BASIC PAGES =================

  app.get("/", (req, res) => res.render("home"));
  app.get("/donate", (req, res) => res.render("donate"));

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  });

  app.get("/profile", isAuthenticated, async (req, res) => {
    res.render("profile", {
      userData: await usersData.get(req.user.facebookUserID) || {}
    });
  });

  app.get("/logout", (req, res, next) => {
    req.logout(err => {
      if (err) return next(err);
      res.redirect("/");
    });
  });

  // ================= 404 =================

  app.get("*", (req, res) => {
    res.status(404).render("404");
  });

  // ================= SERVER START =================

  const PORT = process.env.PORT || 3001;

  server.listen(PORT, () => {
    console.log("=================================");
    console.log(`🚀 Dashboard running on port ${PORT}`);
    console.log("=================================");
  });

  if (config?.serverUptime?.socket?.enable === true) {
    require("../bot/login/socketIO.js")(server);
  }

};