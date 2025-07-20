import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';
import Post from './post.model';

const Like = sequelize.define('Like', {
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
});

Like.belongsTo(User, { foreignKey: 'userId' });
Like.belongsTo(Post, { foreignKey: 'postId' });

export default Like;