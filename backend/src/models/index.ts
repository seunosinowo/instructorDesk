import { User } from './user.model';
import { Post } from './post.model';
import { Like } from './like.model';
import { Comment } from './comment.model';
import { Teacher } from './teacher.model';
import { Student } from './student.model';
import { School } from './school.model';
import { Connection } from './connection.model';
import { Review } from './review.model';
import { Message } from './message.model';
import { Discussion } from './discussion.model';
import { DiscussionComment } from './discussionComment.model';

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
  User.hasOne(School, { foreignKey: 'userId', as: 'schoolProfile' });

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

  // School associations
  School.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Connection associations
  Connection.belongsTo(User, { foreignKey: 'userId1', as: 'initiator' });
  Connection.belongsTo(User, { foreignKey: 'userId2', as: 'receiver' });

  // Review associations
  Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Message associations (if needed)
  Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
  Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

  // Discussion associations
  User.hasMany(Discussion, { foreignKey: 'userId', as: 'discussions' });
  Discussion.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Discussion.hasMany(DiscussionComment, { foreignKey: 'discussionId', as: 'comments' });

  // Discussion Comment associations
  User.hasMany(DiscussionComment, { foreignKey: 'userId', as: 'discussionComments' });
  DiscussionComment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  DiscussionComment.belongsTo(Discussion, { foreignKey: 'discussionId', as: 'discussion' });
  DiscussionComment.hasMany(DiscussionComment, { foreignKey: 'parentId', as: 'replies' });
  DiscussionComment.belongsTo(DiscussionComment, { foreignKey: 'parentId', as: 'parent' });
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
  School,
  Connection,
  Review,
  Message,
  Discussion,
  DiscussionComment,
  setupAssociations
};