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
  profileCompleted: boolean;
  emailConfirmed: boolean;
  confirmationToken?: string;
  createdAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'profileCompleted' | 'emailConfirmed' | 'createdAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public role!: 'teacher' | 'student';
  public name!: string;
  public bio?: string;
  public profileCompleted!: boolean;
  public emailConfirmed!: boolean;
  public confirmationToken?: string;
  public createdAt!: Date;

  static associate(models: any) {
    // Associations defined elsewhere
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
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'Users',
  hooks: {
    beforeSave: async (user: User) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// Associations
import { Comment } from './comment.model';
import { Connection } from './connection.model';
import { Like } from './like.model';
import { Post } from './post.model';
import { Review } from './review.model';
import { Teacher } from './teacher.model';

User.hasMany(Comment, { foreignKey: 'userId' });
User.hasMany(Connection, { foreignKey: 'userId1' });
User.hasMany(Connection, { foreignKey: 'userId2' });
User.hasMany(Like, { foreignKey: 'userId' });
User.hasMany(Post, { foreignKey: 'userId' });
User.hasMany(Review, { foreignKey: 'userId' });
User.hasOne(Teacher, { foreignKey: 'userId' });

export { User };