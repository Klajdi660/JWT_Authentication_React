import config from "config";
import { DataTypes, Model } from "sequelize";
import { sequelizeConnection } from "../clients/db/database";
import { EmailProviderConfig } from "../types";

const emailProvider = config.get<EmailProviderConfig>("emailProvider");

export class User extends Model {
  id: number;
  email: string;
  username: string;
  password: string | any;
  role: string;
  provider: string;
  extra: string;
  verified: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "user",
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: emailProvider.email,
    },
    extra: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    lastLogin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeConnection,
    //    timestamps: true,
    modelName: "Users",
    tableName: "users",
  }
);
