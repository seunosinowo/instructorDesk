import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PostAttributes {
  id: string;
  userId: string;
  content: string;
  type: 'general' | 'educational' | 'job' | 'learning' | 'achievement' | 'question';
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PostCreationAttributes extends Optional<PostAttributes, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'commentsCount'> {}

class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
  public id!: string;
  public userId!: string;
  public content!: string;
  public type!: 'general' | 'educational' | 'job' | 'learning' | 'achievement' | 'question';
  public imageUrl?: string;
  public likesCount!: number;
  public commentsCount!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Association properties
  public user?: any;
  public likes?: any[];
  public comments?: any[];

  static associate(models: any) {
    // Associations defined in models/index.ts
  }
}

Post.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('general', 'educational', 'job', 'learning', 'achievement', 'question'),
    defaultValue: 'general'
  },
  imageUrl: {
    type: DataTypes.STRING
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'Posts',
  timestamps: true
});

// Associations are defined in models/index.ts to avoid circular dependencies

export { Post };