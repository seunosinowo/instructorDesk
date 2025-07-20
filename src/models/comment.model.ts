import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';
import Post from './post.model';

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: Post, key: 'id' },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

Comment.belongsTo(User, { foreignKey: 'userId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

export default Comment;