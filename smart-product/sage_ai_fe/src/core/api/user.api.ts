import { UserProfile } from '../models/user.model'
import { BaseApiService } from './base.api'

class UserApi extends BaseApiService {
  constructor() {
    super('users')
  }

  async getUserInfo(): Promise<UserProfile> {
    return this.get<UserProfile>('/user_info')
  }
}

export const userApi = new UserApi()
