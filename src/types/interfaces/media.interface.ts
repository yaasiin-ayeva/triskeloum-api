import { DeepPartial } from 'typeorm';
import { User } from '../../models/User.model';

export interface IMedia {
  path: string;
  filename: string;
  size: number;
  destination: string;
  encoding?: string;
  originalname?: string;
  fieldname?: string;
  owner?: number | User | DeepPartial<User>;
}