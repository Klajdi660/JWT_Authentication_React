import { Op } from "sequelize";
import config from "config";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models";
import { log } from "../utils";
import { EmailProviderConfig, GoogleConfig } from "../types";

const { googleClientId, googleClientSecret, googleOauthCallbackUrl } =
  config.get<GoogleConfig>("googleConfig");
const emailProvider = config.get<EmailProviderConfig>("emailProvider");

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
        provider: emailProvider.google,
        extra: JSON.stringify(extraData),
        verified: true,
      };

      try {
        let user = await User.findOne({
          where: {
            extra: {
              [Op.like]: `%${googleId}%`,
            },
          },
        });

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
        action: "googleAuthCatch",
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
