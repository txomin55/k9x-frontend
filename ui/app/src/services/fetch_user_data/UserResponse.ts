export type User = {
  getOwner: () => string;
  getNews: () => string[];
};

export default (data): User => ({
  getOwner: () => data.owner,
  getNews: () => data.news ?? [],
});
