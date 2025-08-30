import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User } from './user.model';

interface SchoolAttributes {
  id: string;
  userId: string;
  schoolName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  phoneNumber?: string;
  website?: string;
  accreditations?: string;
  schoolType: 'public' | 'private' | 'charter' | 'international';
  gradeLevels: string[];
  studentCount?: number;
  teacherCount?: number;
  establishedYear?: number;
  description?: string;
  facilities?: string[];
  extracurricularActivities?: string[];
  socialLinks?: object;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SchoolCreationAttributes extends Optional<SchoolAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class School extends Model<SchoolAttributes, SchoolCreationAttributes> implements SchoolAttributes {
  public id!: string;
  public userId!: string;
  public schoolName!: string;
  public address!: string;
  public city!: string;
  public state!: string;
  public country!: string;
  public postalCode?: string;
  public phoneNumber?: string;
  public website?: string;
  public accreditations?: string;
  public schoolType!: 'public' | 'private' | 'charter' | 'international';
  public gradeLevels!: string[];
  public studentCount?: number;
  public teacherCount?: number;
  public establishedYear?: number;
  public description?: string;
  public facilities?: string[];
  public extracurricularActivities?: string[];
  public socialLinks?: object;
  public createdAt!: Date;
  public updatedAt!: Date;
}

School.init({
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
  schoolName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  postalCode: {
    type: DataTypes.STRING
  },
  phoneNumber: {
    type: DataTypes.STRING
  },
  website: {
    type: DataTypes.STRING
  },
  accreditations: {
    type: DataTypes.STRING
  },
  schoolType: {
    type: DataTypes.ENUM('public', 'private', 'charter', 'international'),
    allowNull: false
  },
  gradeLevels: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  studentCount: {
    type: DataTypes.INTEGER
  },
  teacherCount: {
    type: DataTypes.INTEGER
  },
  establishedYear: {
    type: DataTypes.INTEGER
  },
  description: {
    type: DataTypes.TEXT
  },
  facilities: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  extracurricularActivities: {
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
  tableName: 'Schools',
  timestamps: true
});

// Associations are defined in models/index.ts to avoid circular dependencies

export { School };