import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

interface UserAttributes {
  id: string;
  email: string;
  password: string;
  role: 'teacher' | 'student';
  name: string;
  bio?: string;
  profilePicture?: string;
  profileCompleted: boolean;
  emailConfirmed: boolean;
  confirmationToken?: string;
  refreshToken?: string;
  refreshTokenExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'profileCompleted' | 'emailConfirmed' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public role!: 'teacher' | 'student';
  public name!: string;
  public bio?: string;
  public profilePicture?: string;
  public profileCompleted!: boolean;
  public emailConfirmed!: boolean;
  public confirmationToken?: string;
  public refreshToken?: string;
  public refreshTokenExpiry?: Date;
  public createdAt!: Date;
  public updatedAt!: Date;

  static associate(models: any) {
    // Associations defined in models/index.ts
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('teacher', 'student'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bio: {
    type: DataTypes.TEXT
  },
  profilePicture: {
    type: DataTypes.STRING
  },
  profileCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailConfirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  confirmationToken: {
    type: DataTypes.STRING
  },
  refreshToken: {
    type: DataTypes.STRING
  },
  refreshTokenExpiry: {
    type: DataTypes.DATE
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'Users',
  timestamps: true,
  hooks: {
    beforeSave: async (user: User) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// Associations are defined in models/index.ts to avoid circular dependencies

export { User };
