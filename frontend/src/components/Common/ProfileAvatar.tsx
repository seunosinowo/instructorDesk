import React from 'react';

interface ProfileAvatarProps {
  name: string;
  profilePicture?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  name, 
  profilePicture, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
      {profilePicture ? (
        <img 
          src={profilePicture} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full bg-orange-primary flex items-center justify-center text-white font-bold">
                  ${getInitials(name)}
                </div>
              `;
            }
          }}
        />
      ) : (
        <div className="w-full h-full bg-orange-primary flex items-center justify-center text-white font-bold">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;