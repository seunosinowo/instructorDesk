import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User } from './user.model';
import { Teacher } from './teacher.model';

interface ReviewAttributes {
  id: string;
  userId: string;
  teacherId: string;
  rating: number;
  comment: string;
  createdAt?: Date;
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id' | 'createdAt'> {}

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  public id!: string;
  public userId!: string;
  public teacherId!: string;
  public rating!: number;
  public comment!: string;
  public createdAt!: Date;
}

Review.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  },
  teacherId: {
    type: DataTypes.UUID,
    references: {
      model: Teacher,
      key: 'id'
    },
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'Reviews'
});

User.hasMany(Review, { foreignKey: 'userId' });
Teacher.hasMany(Review, { foreignKey: 'teacherId' });

export { Review };