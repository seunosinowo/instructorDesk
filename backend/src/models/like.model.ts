import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

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
    allowNull: false
  },
  postId: {
    type: DataTypes.UUID,
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

// Associations are defined in models/index.ts to avoid circular dependencies

export { Like };