export interface UserModel {
  email: string;
  image: string;
  name: string;
}

export type User = {
  getName: () => string;
  getImage: () => string;
  getEmail: () => string;
  getInitials: () => string;
  getNews: () => [];
};

export default (data: UserModel): User => ({
  getName: () => data.name,
  getImage: () => data.image,
  getEmail: () => data.email,
  getInitials: () => data.name.slice(0, 2),
  getNews: () => [],
});
