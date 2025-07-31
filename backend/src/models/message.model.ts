import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MessageAttributes {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: string;
  public senderId!: string;
  public receiverId!: string;
  public content!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
  }
);

// Associations are defined in models/index.ts to avoid circular dependencies