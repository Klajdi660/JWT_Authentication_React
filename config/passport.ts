import { Op } from "sequelize";
import config from "config";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../src/models";
import { EMAIL_PROVIDER } from "../src/constants";
import { log } from "../src/utils";
import { GoogleConfig } from "../src/types";

const { googleClientId, googleClientSecret, googleOauthCallbackUrl } =
  config.get<GoogleConfig>("googleConfig");

type ProfileType = {
  [key: string]: any;
};

interface VerifyCallbackParams {
  accessToken: string;
  refreshToken: string;
  profile: ProfileType;
  done: () => void;
}

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
    console.log("strategyOptions :>> ", strategyOptions);
    const verifyCallback = async (
      accessToken: string,
      refreshToken: string,
      profile: { [key: string]: any },
      done: any
    ) => {
      const { displayName, photos, emails, id: googleId, _json } = profile;
      console.log("profile :>> ", profile);
      const { email_verified } = _json;
      const username = displayName.replace(/\s/g, "").toLowerCase();

      const extraData = {
        name: displayName,
        photos: photos[0].value,
        googleId,
      };

      const newUser = {
        email: emails[0].value,
        username,
        password: "",
        provider: EMAIL_PROVIDER.Google,
        extra: JSON.stringify(extraData),
        verified: true,
      };
      console.log("newUser :>> ", newUser);
      try {
        // let user = await User.findOne({ where: { googleId: id } });
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
          console.log("user :>> ", user);
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

const linkedinAuth = async () => {
  try {
  } catch (e) {
    log.error(
      JSON.stringify({
        action: "linkedinAuthCatch",
        message: "Missing facebook keys!",
        data: e,
      })
    );
  }
};

const facebookAuth = async () => {
  try {
  } catch (e) {
    log.error(
      JSON.stringify({
        action: "facebookAuthCatch",
        message: "Missing facebook keys!",
        data: e,
      })
    );
  }
};

export default async (app: any) => {
  app.use(passport.initialize());
  await googleAuth();
  await linkedinAuth();
  await facebookAuth();
};
