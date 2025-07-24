import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User } from './user.model';

interface ConnectionAttributes {
  id: string;
  userId1: string;
  userId2: string;
  createdAt?: Date;
  status?: string; // Added status property
}

interface ConnectionCreationAttributes extends Optional<ConnectionAttributes, 'id' | 'createdAt'> {}

class Connection extends Model<ConnectionAttributes, ConnectionCreationAttributes> implements ConnectionAttributes {
  public id!: string;
  public userId1!: string;
  public userId2!: string;
  public createdAt!: Date;
  public status?: string; // Added status property
}

Connection.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId1: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  },
  userId2: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'Connections'
});

User.belongsToMany(User, { through: Connection, as: 'connections', foreignKey: 'userId1' });

export { Connection };