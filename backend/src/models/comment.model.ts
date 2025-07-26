import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User } from './user.model';
import { Post } from './post.model';

interface CommentAttributes {
  id: number;
  userId: string;
  postId: string;
  content: string;
  createdAt?: Date;
}

interface CommentCreationAttributes extends Optional<CommentAttributes, 'id' | 'createdAt'> {}

class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: number;
  public userId!: string;
  public postId!: string;
  public content!: string;
  public createdAt!: Date;
}

Comment.init({
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
  tableName: 'Comments'
});

User.hasMany(Comment, { foreignKey: 'userId' });
Post.hasMany(Comment, { foreignKey: 'postId' });

export { Comment };