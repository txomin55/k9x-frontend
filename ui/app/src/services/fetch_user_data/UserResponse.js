export default (data) => ({
  getOwner: () => data.owner,
  getNews: () => data.news ?? [],
});
