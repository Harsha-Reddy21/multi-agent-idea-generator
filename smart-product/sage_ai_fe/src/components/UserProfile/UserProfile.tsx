import './UserProfile.scss'

import React from 'react'

import { UserProfile as UserProfileModel } from '../../core/models/user.model'

interface UserProfileProps {
  userProfile: UserProfileModel
}

const UserProfile: React.FC<UserProfileProps> = ({ userProfile }) => {
  const truncatedName =
    userProfile.name.length > 20
      ? `${userProfile.name.substring(0, 20)}...`
      : userProfile.name

  return (
    <div className="user-profile">
      <div className="user-profile__separator" />
      <div className="user-profile__avatar" title={userProfile.name}>
        {userProfile.name.charAt(0).toUpperCase()}
      </div>
      <span className="user-profile__text" title={userProfile.name}>
        {' '}
        {truncatedName}
      </span>
    </div>
  )
}

export default UserProfile
