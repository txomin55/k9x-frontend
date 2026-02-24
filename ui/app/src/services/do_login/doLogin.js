export default (login, cb) => login().then(() => (cb ? cb() : null));
