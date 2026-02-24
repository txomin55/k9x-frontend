import { ROUTES } from "@/routes";
import { isLocal } from "@/utils/environment";

export default (data) => ({
  getUrl: () => (isLocal ? `${ROUTES.HOME.slice(1)}` : data.url),
});
