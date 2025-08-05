export interface User {
  id: string;
  email: string;
  role: string;
  name: string;
  bio: string;
  profileCompleted: boolean;
  profilePicture?: string;
  profile?: TeacherProfile | StudentProfile;
}

export interface TeacherProfile {
  id?: string;
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
  socialLinks?: {
    linkedin?: string;
    website?: string;
    twitter?: string;
  };
}

export interface StudentProfile {
  id?: string;
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
  socialLinks?: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  type: 'general' | 'educational' | 'job' | 'learning' | 'achievement' | 'question';
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    role: string;
    profilePicture?: string;
  };
  likes?: Like[];
  comments?: Comment[];
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    profilePicture?: string;
  };
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    profilePicture?: string;
  };
}