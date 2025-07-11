import config from "config";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { log } from "../utils";
import { User } from "../models";
import { GoogleConfigs } from "../types";
import { EMAIL_PROVIDERS } from "../constants";
import { getUserByProviderId } from "./user.service";

const { googleClientId, googleClientSecret, googleOauthCallbackUrl } =
  config.get<GoogleConfigs>("providersConfigs.google");

const secret = "Klajdi96@";
let opts = {} as any;
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = secret;

passport.use(
  new JwtStrategy(opts, async (payload, done) => {
    try {
      const user = await User.findByPk(payload.id);
      if (user) {
        return done(null, user);
      }

      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);

const googleAuth = async () => {
  try {
    const strategyOptions = {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleOauthCallbackUrl,
    };

    const verifyCallback = async (
      accessToken: string,
      refreshToken: string,
      profile: { [key: string]: any },
      done: any
    ) => {
      const { displayName, photos, emails, id: googleId, _json } = profile;
      const { email_verified } = _json;

      if (!email_verified) {
        return { error: true, message: "Google account not verified" };
      }

      const username = displayName.replace(/\s/g, "").toLowerCase();
      const extraData = {
        name: displayName,
        avatar: photos[0].value,
        googleId,
      };

      const newUser = {
        email: emails[0].value,
        username,
        password: "",
        provider: EMAIL_PROVIDERS.Google,
        extra: JSON.stringify(extraData),
        verified: true,
      };

      try {
        let user = await getUserByProviderId(googleId);
        if (user) {
          done(null, user);
        } else {
          user = await User.create(newUser);
          done(null, user);
        }
      } catch (err) {
        log.error(err);
      }
    };

    passport.use(new GoogleStrategy(strategyOptions, verifyCallback));
  } catch (error) {
    log.error(
      JSON.stringify({
        action: "google_auth_catch",
        message: "Missing google keys!",
        data: error,
      })
    );
  }
};

export default async (app: any) => {
  app.use(passport.initialize());
  await googleAuth();
};
