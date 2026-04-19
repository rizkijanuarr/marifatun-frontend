import type { UserDashboardModel } from '../Model/UserModel';
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserApiDto,
  UserListQuery,
} from '../Response/UserResponse';

export interface UserRepository {
  getUsersDashboard(query: UserListQuery): Promise<UserDashboardModel>;
  getUser(id: string): Promise<UserApiDto>;
  createUser(payload: CreateUserPayload): Promise<UserApiDto>;
  updateUser(id: string, payload: UpdateUserPayload): Promise<UserApiDto>;
  deleteUser(id: string): Promise<void>;
}
