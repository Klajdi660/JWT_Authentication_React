import { DataTypes, Model } from "sequelize";
import { sequelizeConnection } from "../clients/db/database";
import { EMAIL_PROVIDER } from "../constants";

export class User extends Model {
  id: number;
  email: string;
  username: string;
  password: string;
  role: string;
  provider: string;
  extra: string;
  verified: boolean;
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
      defaultValue: EMAIL_PROVIDER.Email,
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
