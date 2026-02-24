import UserResponse from "@/services/fetch_user_data/UserResponse.js";

export default (getUserData, cb) =>
  getUserData()
    .then((d) => UserResponse(d))
    .then((d) => (cb ? cb(d) : null));
