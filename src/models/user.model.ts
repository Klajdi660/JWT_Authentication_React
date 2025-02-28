import { DataTypes, Model } from "sequelize";
import { EMAIL_PROVIDERS } from "../constants";
import { sequelizeConnection } from "../clients/db/database";

export class User extends Model {
  id: number;
  role: string;
  email: string;
  extra: string;
  username: string;
  provider: string;
  verified: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  password: string | any;
}

User.init(
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    email: {
      unique: true,
      allowNull: false,
      type: DataTypes.STRING,
    },
    username: {
      unique: true,
      allowNull: false,
      type: DataTypes.STRING,
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    role: {
      defaultValue: "user",
      type: DataTypes.STRING,
    },
    provider: {
      allowNull: false,
      type: DataTypes.STRING,
      defaultValue: EMAIL_PROVIDERS.Email,
    },
    extra: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    verified: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    lastLogin: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      allowNull: true,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: sequelizeConnection,
    //    timestamps: true,
    modelName: "Users",
    tableName: "users",
  }
);
