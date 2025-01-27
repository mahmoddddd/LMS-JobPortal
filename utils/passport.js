const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../models/userModel");
const dotenv = require("dotenv");
dotenv.config();
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        console.log(profile);

        // 1. Check if the user already exists by googleId
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // 2. If not found by googleId, check by email
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // 3. If user exists by email but not by googleId, add googleId to the existing user
            user.googleId = profile.id;
            await user.save();
          } else {
            // 4. If user doesn't exist, create a new user
            user = await User.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              firstname: profile.displayName,
              lastname: profile.name.familyName,
              user_imag: profile.photos[0].value,
              roles: "user",
            });
          }
        }

        // Return the user object
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
