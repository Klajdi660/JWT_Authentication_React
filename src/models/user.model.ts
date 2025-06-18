import { DataTypes, Model, Optional } from "sequelize";
import { EMAIL_PROVIDERS, ROLES } from "../constants";
import { sequelizeConnection } from "../clients/db/database";

export class User extends Model {
  public id: number;
  public email: string;
  public username: string;
  public password: string;
  public role: string;
  public provider: string;
  public verified: boolean;
  public extra: string;
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

// Define User attributes
// export interface UserAttributes {
//   id: number;
//   email: string;
//   username: string;
//   password: string;
//   role: string;
//   provider: string;
//   extra: string;
//   verified: boolean;
//   lastLogin: string | null;
//   createdAt?: Date;
//   updatedAt?: Date;
//   deletedAt?: Date | null;
// }

// Some fields are optional during User creation
// export interface UserCreationAttributes
//   extends Optional<
//     UserAttributes,
//     | "id"
//     | "role"
//     | "provider"
//     | "lastLogin"
//     | "createdAt"
//     | "updatedAt"
//     | "deletedAt"
//   > {}

// export class User
//   extends Model<UserAttributes, UserCreationAttributes>
//   implements UserAttributes
// {
//   public id!: number;
//   public email!: string;
//   public username!: string;
//   public password!: string;
//   public role!: string;
//   public provider!: string;
//   public extra!: string;
//   public verified!: boolean;
//   public lastLogin!: string | null;
//   public readonly createdAt!: Date;
//   public readonly updatedAt!: Date;
//   public readonly deletedAt!: Date | null;
// }

// User.init(
//   {
//     id: {
//       primaryKey: true,
//       autoIncrement: true,
//       type: DataTypes.INTEGER,
//     },
//     email: {
//       unique: true,
//       allowNull: false,
//       type: DataTypes.STRING,
//     },
//     username: {
//       allowNull: false,
//       type: DataTypes.STRING,
//     },
//     password: {
//       allowNull: false,
//       type: DataTypes.STRING,
//     },
//     role: {
//       allowNull: false,
//       defaultValue: ROLES.User,
//       type: DataTypes.STRING,
//     },
//     provider: {
//       allowNull: false,
//       defaultValue: EMAIL_PROVIDERS.Email,
//       type: DataTypes.STRING,
//     },
//     extra: {
//       allowNull: false,
//       type: DataTypes.TEXT,
//     },
//     verified: {
//       allowNull: false,
//       defaultValue: false,
//       type: DataTypes.BOOLEAN,
//     },
//     lastLogin: {
//       allowNull: true,
//       type: DataTypes.STRING,
//     },
//   },
//   {
//     sequelize: sequelizeConnection,
//     timestamps: true,
//     paranoid: true,
//     modelName: "User",
//     tableName: "users",
//   }
// );
