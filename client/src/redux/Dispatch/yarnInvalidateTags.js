import ContentMasterApi from "../services/contentMasterService";
import CountsMasterApi from "../services/CountsMaster.service";
import YarnMasterApi from "../services/YarnMasterService";
import store from "../store";

export const invalidateYarnModule = () => {
  store.dispatch(ContentMasterApi.util.invalidateTags(["ContentMaster"]));
  store.dispatch(CountsMasterApi.util.invalidateTags(["CountsMaster"]));
  store.dispatch(YarnMasterApi.util.invalidateTags(["YarnMaster"]));
};
