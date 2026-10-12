import FabricMasterApi from "../services/FabricMasterService";
import GaugeMasterApi from "../services/GaugeMasterService";
import LoopLengthMasterApi from "../services/LooplengthMasterService";
import DiaMasterApi from "../services/DiaMasterService";
import DesignMasterApi from "../services/DesignMasterService";
import store from "../store";

export const invalidateFabricModule = () => {
  store.dispatch(FabricMasterApi.util.invalidateTags(["FabricMaster"]));
  store.dispatch(GaugeMasterApi.util.invalidateTags(["GaugeMaster"]));
  store.dispatch(LoopLengthMasterApi.util.invalidateTags(["LoopLengthMaster"]));
  store.dispatch(DiaMasterApi.util.invalidateTags(["DiaMaster"]));
  store.dispatch(DesignMasterApi.util.invalidateTags(["DesignMaster"]));
};
