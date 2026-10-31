import TaxTemplateApi from "../services/TaxTemplateServices";
import PaytermMasterApi from "../services/payTermMasterService";
import partyMasterApi from "../services/PartyMasterService";
import cityMasterApi from "../services/CityMasterService";
import HsnMasterApi from "../services/HsnMasterServices";
import ColorMasterApi from "../services/ColorMasterService";
import uomMasterApi from "../services/UomMasterService";
import bankMasterApi from "../services/BankMasterService";
import FabricMasterApi from "../services/FabricMasterService";
import GaugeMasterApi from "../services/GaugeMasterService";
import LoopLengthMasterApi from "../services/LooplengthMasterService";
import DiaMasterApi from "../services/DiaMasterService";
import DesignMasterApi from "../services/DesignMasterService";
import GsmMasterApi from "../services/GsmMasterService";

import store from "../store";

export const invalidateFabricModule = () => {
  store.dispatch(TaxTemplateApi.util.invalidateTags(["TaxTemplate"]));
  store.dispatch(PaytermMasterApi.util.invalidateTags(["PaytermMaster"]));
  store.dispatch(partyMasterApi.util.invalidateTags(["Party"]));
  store.dispatch(cityMasterApi.util.invalidateTags(["City"]));
  store.dispatch(bankMasterApi.util.invalidateTags(["bank"]));
  store.dispatch(FabricMasterApi.util.invalidateTags(["FabricMaster"]));
  store.dispatch(HsnMasterApi.util.invalidateTags(["HsnMaster"]));
  store.dispatch(ColorMasterApi.util.invalidateTags(["ColorMaster"]));
  store.dispatch(DesignMasterApi.util.invalidateTags(["DesignMaster"]));
  store.dispatch(GaugeMasterApi.util.invalidateTags(["GaugeMaster"]));
  store.dispatch(LoopLengthMasterApi.util.invalidateTags(["LoopLengthMaster"]));
  store.dispatch(GsmMasterApi.util.invalidateTags(["GsmMaster"]));
  store.dispatch(DiaMasterApi.util.invalidateTags(["DiaMaster"]));
  store.dispatch(uomMasterApi.util.invalidateTags(["UomMaster"]));
};
