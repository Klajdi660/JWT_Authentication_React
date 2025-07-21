import { DataTypes, Model } from "sequelize";
import { EMAIL_PROVIDERS, ROLES } from "../constants";
import { sequelizeConnection } from "../clients/db/database";

export class User extends Model {
  public id: number;
  public role: string;
  public email: string;
  public extra: string;
  public username: string;
  public password: string | undefined;
  public provider: string;
  public verified: boolean;
  public lastLogin: string;
  public readonly createdAt: string;
  public readonly updatedAt: string;
  public readonly deletedAt: string;
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
      allowNull: false,
      type: DataTypes.STRING,
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    role: {
      allowNull: false,
      defaultValue: ROLES.User,
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
    // createdAt: {
    //   allowNull: false,
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // },
    // updatedAt: {
    //   allowNull: true,
    //   type: DataTypes.DATE,
    //   // defaultValue: DataTypes.NOW,
    // },
    // deletedAt: {
    //   allowNull: true,
    //   type: DataTypes.DATE,
    // },
  },
  {
    sequelize: sequelizeConnection,
    timestamps: true, // enables createdAt and updatedAt
    paranoid: true, // enables deletedAt
    modelName: "Users",
    tableName: "users",
  }
);
