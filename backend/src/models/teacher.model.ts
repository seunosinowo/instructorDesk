import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User } from './user.model';

interface TeacherAttributes {
  id: string;
  userId: string;
  subjects: string[];
  qualifications: string;
  experience: number;
  specializations?: string[];
  teachingMethods?: string[];
  availability?: string;
  hourlyRate?: number;
  location?: string;
  languages?: string[];
  certifications?: string[];
  education?: string;
  achievements?: string[];
  teachingPhilosophy?: string;
  preferredStudentLevel?: string[];
  contactPreference?: string;
  socialLinks?: object;
  createdAt?: Date;
}

interface TeacherCreationAttributes extends Optional<TeacherAttributes, 'id' | 'createdAt'> {}

class Teacher extends Model<TeacherAttributes, TeacherCreationAttributes> implements TeacherAttributes {
  public id!: string;
  public userId!: string;
  public subjects!: string[];
  public qualifications!: string;
  public experience!: number;
  public specializations?: string[];
  public teachingMethods?: string[];
  public availability?: string;
  public hourlyRate?: number;
  public location?: string;
  public languages?: string[];
  public certifications?: string[];
  public education?: string;
  public achievements?: string[];
  public teachingPhilosophy?: string;
  public preferredStudentLevel?: string[];
  public contactPreference?: string;
  public socialLinks?: object;
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
  specializations: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  teachingMethods: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  availability: {
    type: DataTypes.STRING
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2)
  },
  location: {
    type: DataTypes.STRING
  },
  languages: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  certifications: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  education: {
    type: DataTypes.TEXT
  },
  achievements: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  teachingPhilosophy: {
    type: DataTypes.TEXT
  },
  preferredStudentLevel: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  contactPreference: {
    type: DataTypes.STRING
  },
  socialLinks: {
    type: DataTypes.JSONB,
    defaultValue: {}
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
