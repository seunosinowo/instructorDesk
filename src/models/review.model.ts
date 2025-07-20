import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';
import Teacher from './teacher.model';

const Review = sequelize.define('Review', {
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
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: Teacher, key: 'id' },
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

Review.belongsTo(User, { foreignKey: 'userId' });
Review.belongsTo(Teacher, { foreignKey: 'teacherId' });

export default Review;