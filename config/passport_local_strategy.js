//import the required packegs
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const bcrypt = require("bcrypt");

//authentication using passport
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },

    async function (req, email, password, done) {

      let user = await User.findOne({ email: email });
      
      if(user){
        const isPasswordMatched = bcrypt.compareSync(password, user.password);
        if (!user || !isPasswordMatched) {
          req.flash("error", "Invalid Username / Password or you Don't have an account? Sign Up ");
          console.log("Invalid Username / Password  ");
          return done(null, false);
        }
        
      }
      return done(null, user);
    }
  )
);

//serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

//deserializing the user from the key in the cookies
passport.deserializeUser(async function (id, done) {
  let userID = await User.findById(id);
  if (!userID) {
    console.log("Error in config/passport-local-user");
    return;
  }

  return done(null, userID);
});

//check if user is authenticated
passport.checkAuthentication = function (req, res, next) {
  //if the user is signed in then the pass on the request to next controller action.
  if (req.isAuthenticated()) {
    return next();
  }

  //if the user is not singed in
  return res.redirect("/user/sign-in");
};

passport.setAuthenticatedUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }

  next();
};

module.exports = passport;
