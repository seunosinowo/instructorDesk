import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User } from './user.model';

interface TeacherAttributes {
  id: string;
  userId: string;
  subjects: string[];
  qualifications: string;
  experience: number;
  createdAt?: Date;
}

interface TeacherCreationAttributes extends Optional<TeacherAttributes, 'id' | 'createdAt'> {}

class Teacher extends Model<TeacherAttributes, TeacherCreationAttributes> implements TeacherAttributes {
  public id!: string;
  public userId!: string;
  public subjects!: string[];
  public qualifications!: string;
  public experience!: number;
  public createdAt!: Date;
}

Teacher.init({
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
    allowNull: false,
    unique: true
  },
  subjects: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false
  },
  qualifications: {
    type: DataTypes.STRING,
    allowNull: false
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'Teachers'
});

User.hasOne(Teacher, { foreignKey: 'userId' });

export { Teacher };