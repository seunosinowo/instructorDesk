import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User } from './user.model';

interface DiscussionAttributes {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'academic' | 'career' | 'resources' | 'events' | 'other';
  userId: string;
  isPinned: boolean;
  isClosed: boolean;
  viewCount: number;
  upvoteCount: number;
  commentCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DiscussionCreationAttributes extends Optional<DiscussionAttributes, 'id' | 'createdAt' | 'updatedAt' | 'isPinned' | 'isClosed' | 'viewCount' | 'upvoteCount' | 'commentCount'> {}

class Discussion extends Model<DiscussionAttributes, DiscussionCreationAttributes> implements DiscussionAttributes {
  public id!: string;
  public title!: string;
  public content!: string;
  public category!: 'general' | 'academic' | 'career' | 'resources' | 'events' | 'other';
  public userId!: string;
  public isPinned!: boolean;
  public isClosed!: boolean;
  public viewCount!: number;
  public upvoteCount!: number;
  public commentCount!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Association mixins
  public readonly user?: User;
}

Discussion.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [5, 200]
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 5000]
    }
  },
  category: {
    type: DataTypes.ENUM('general', 'academic', 'career', 'resources', 'events', 'other'),
    allowNull: false,
    defaultValue: 'general'
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isClosed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  upvoteCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  commentCount: {
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
  tableName: 'Discussions',
  timestamps: true
});

export { Discussion };