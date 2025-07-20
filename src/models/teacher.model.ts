import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';

const Teacher = sequelize.define('Teacher', {
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
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  experience: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Teacher.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Teacher, { foreignKey: 'userId' });

export default Teacher;