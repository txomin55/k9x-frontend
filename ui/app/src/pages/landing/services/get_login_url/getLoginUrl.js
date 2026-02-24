import Oauth2UrlResponse from "@/pages/landing/services/get_login_url/Oauth2UrlResponse";

export default (loginUrl) => loginUrl().then((d) => Oauth2UrlResponse(d));
