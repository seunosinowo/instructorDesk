import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User } from './user.model';
import { Discussion } from './discussion.model';

interface DiscussionCommentAttributes {
  id: string;
  content: string;
  discussionId: string;
  userId: string;
  parentId?: string; // For nested replies
  upvoteCount: number;
  isEdited: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DiscussionCommentCreationAttributes extends Optional<DiscussionCommentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'parentId' | 'upvoteCount' | 'isEdited'> {}

class DiscussionComment extends Model<DiscussionCommentAttributes, DiscussionCommentCreationAttributes> implements DiscussionCommentAttributes {
  public id!: string;
  public content!: string;
  public discussionId!: string;
  public userId!: string;
  public parentId?: string;
  public upvoteCount!: number;
  public isEdited!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Association mixins
  public readonly user?: User;
  public readonly discussion?: Discussion;
  public readonly parent?: DiscussionComment;
  public readonly replies?: DiscussionComment[];
}

DiscussionComment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 2000]
    }
  },
  discussionId: {
    type: DataTypes.UUID,
    references: {
      model: 'Discussions',
      key: 'id'
    },
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  },
  parentId: {
    type: DataTypes.UUID,
    references: {
      model: 'DiscussionComments',
      key: 'id'
    },
    allowNull: true
  },
  upvoteCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  tableName: 'DiscussionComments',
  timestamps: true
});

export { DiscussionComment };