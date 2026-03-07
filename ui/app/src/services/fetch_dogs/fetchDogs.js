export default (getDogs, cb) =>
  getDogs().then((d) => (cb ? cb(d) : null));
