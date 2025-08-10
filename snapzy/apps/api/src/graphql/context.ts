import { userLoader } from './loaders/user.loader';

export function createGraphqlContext() {
  return { loaders: { userLoader } };
}