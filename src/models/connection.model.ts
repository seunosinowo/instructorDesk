import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';
import { Op } from 'sequelize';

const Connection = sequelize.define('Connection', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  requesterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  receiverId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  },
});

Connection.belongsTo(User, { foreignKey: 'requesterId', as: 'Requester' });
Connection.belongsTo(User, { foreignKey: 'receiverId', as: 'Receiver' });

export default Connection;
export { Op };