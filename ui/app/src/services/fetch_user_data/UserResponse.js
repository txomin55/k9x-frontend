export default (data) => ({
  getOrganizations: () => data.organizations ?? [],
  getOwner: () => data.owner,
  getNews: () => data.news ?? [],
});
