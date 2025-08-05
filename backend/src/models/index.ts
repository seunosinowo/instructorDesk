import { User } from './user.model';
import { Post } from './post.model';
import { Like } from './like.model';
import { Comment } from './comment.model';
import { Teacher } from './teacher.model';
import { Student } from './student.model';
import { Connection } from './connection.model';
import { Review } from './review.model';
import { Message } from './message.model';

// Define all associations here to avoid circular dependencies
const setupAssociations = () => {
  // User associations
  User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
  User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
  User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
  User.hasMany(Connection, { foreignKey: 'userId1', as: 'connectionsInitiated' });
  User.hasMany(Connection, { foreignKey: 'userId2', as: 'connectionsReceived' });
  User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
  User.hasOne(Teacher, { foreignKey: 'userId', as: 'teacherProfile' });
  User.hasOne(Student, { foreignKey: 'userId', as: 'studentProfile' });

  // Post associations
  Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' });
  Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });

  // Like associations
  Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

  // Comment associations
  Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

  // Teacher associations
  Teacher.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Student associations
  Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Connection associations
  Connection.belongsTo(User, { foreignKey: 'userId1', as: 'initiator' });
  Connection.belongsTo(User, { foreignKey: 'userId2', as: 'receiver' });

  // Review associations
  Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Message associations (if needed)
  Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
  Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
};

// Call the setup function
setupAssociations();

export {
  User,
  Post,
  Like,
  Comment,
  Teacher,
  Student,
  Connection,
  Review,
  Message,
  setupAssociations
};