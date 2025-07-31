import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface StudentAttributes {
  id: string;
  userId: string;
  interests: string[];
  academicLevel?: string;
  goals?: string[];
  learningStyle?: string;
  preferredSubjects?: string[];
  currentInstitution?: string;
  graduationYear?: number;
  skills?: string[];
  projects?: string[];
  extracurriculars?: string[];
  careerGoals?: string;
  preferredLearningTime?: string;
  budget?: number;
  location?: string;
  languages?: string[];
  socialLinks?: object;
  createdAt?: Date;
  updatedAt?: Date;
}

interface StudentCreationAttributes extends Optional<StudentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Student extends Model<StudentAttributes, StudentCreationAttributes> implements StudentAttributes {
  public id!: string;
  public userId!: string;
  public interests!: string[];
  public academicLevel?: string;
  public goals?: string[];
  public learningStyle?: string;
  public preferredSubjects?: string[];
  public currentInstitution?: string;
  public graduationYear?: number;
  public skills?: string[];
  public projects?: string[];
  public extracurriculars?: string[];
  public careerGoals?: string;
  public preferredLearningTime?: string;
  public budget?: number;
  public location?: string;
  public languages?: string[];
  public socialLinks?: object;
  public createdAt!: Date;
  public updatedAt!: Date;

  static associate(models: any) {
    // Associations defined elsewhere
  }
}

Student.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  interests: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  academicLevel: {
    type: DataTypes.STRING
  },
  goals: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  learningStyle: {
    type: DataTypes.STRING
  },
  preferredSubjects: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  currentInstitution: {
    type: DataTypes.STRING
  },
  graduationYear: {
    type: DataTypes.INTEGER
  },
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  projects: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  extracurriculars: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  careerGoals: {
    type: DataTypes.TEXT
  },
  preferredLearningTime: {
    type: DataTypes.STRING
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2)
  },
  location: {
    type: DataTypes.STRING
  },
  languages: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  socialLinks: {
    type: DataTypes.JSONB,
    defaultValue: {}
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
  tableName: 'Students',
  timestamps: true
});

export { Student };
