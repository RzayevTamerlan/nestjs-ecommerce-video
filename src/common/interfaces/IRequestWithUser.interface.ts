import { UsersDocument } from '../../users/users.model';

export interface IRequestWithUser extends Request {
  user: UsersDocument;
}