export type User = {
  getName: () => string;
  getImage: () => string;
  getEmail: () => string;
  getInitials: () => string;
  getNews: () => [];
};
