import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User } from './user.model';
import { Post } from './post.model';

interface LikeAttributes {
  id: number;
  userId: string;
  postId: string;
  createdAt?: Date;
}

interface LikeCreationAttributes extends Optional<LikeAttributes, 'id' | 'createdAt'> {}

class Like extends Model<LikeAttributes, LikeCreationAttributes> implements LikeAttributes {
  public id!: number;
  public userId!: string;
  public postId!: string;
  public createdAt!: Date;
}

Like.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  },
  postId: {
    type: DataTypes.UUID,
    references: {
      model: Post,
      key: 'id'
    },
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'Likes'
});

User.hasMany(Like, { foreignKey: 'userId' });
Post.hasMany(Like, { foreignKey: 'postId' });

export { Like };