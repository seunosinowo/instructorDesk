import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User } from './user.model';

interface PostAttributes {
  id: string;
  userId: string;
  content: string;
  createdAt?: Date;
}

interface PostCreationAttributes extends Optional<PostAttributes, 'id' | 'createdAt'> {}

class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
  public id!: string;
  public userId!: string;
  public content!: string;
  public createdAt!: Date;
}

Post.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
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
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'Posts'
});

User.hasMany(Post, { foreignKey: 'userId' });

export { Post };