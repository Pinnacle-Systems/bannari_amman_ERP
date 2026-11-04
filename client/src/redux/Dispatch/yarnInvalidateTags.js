import ContentMasterApi from "../services/contentMasterService";
import CountsMasterApi from "../services/CountsMaster.service";
import YarnMasterApi from "../services/YarnMasterService";
import TaxTemplateApi from "../services/TaxTemplateServices";
import PaytermMasterApi from "../services/payTermMasterService";
import partyMasterApi from "../services/PartyMasterService";
import cityMasterApi from "../services/CityMasterService";
import HsnMasterApi from "../services/HsnMasterServices";
import ColorMasterApi from "../services/ColorMasterService";
import uomMasterApi from "../services/UomMasterService";
import bankMasterApi from "../services/BankMasterService";
import store from "../store";

export const invalidateYarnModule = () => {
  store.dispatch(ContentMasterApi.util.invalidateTags(["ContentMaster"]));
  store.dispatch(CountsMasterApi.util.invalidateTags(["CountsMaster"]));
  store.dispatch(YarnMasterApi.util.invalidateTags(["YarnMaster"]));
  store.dispatch(TaxTemplateApi.util.invalidateTags(["TaxTemplate"]));
  store.dispatch(PaytermMasterApi.util.invalidateTags(["PaytermMaster"]));
  store.dispatch(partyMasterApi.util.invalidateTags(["Party"]));
  store.dispatch(cityMasterApi.util.invalidateTags(["City"]));
  store.dispatch(HsnMasterApi.util.invalidateTags(["HsnMaster"]));
  store.dispatch(ColorMasterApi.util.invalidateTags(["ColorMaster"]));
  store.dispatch(uomMasterApi.util.invalidateTags(["UomMaster"]));
  store.dispatch(bankMasterApi.util.invalidateTags(["bank"]));
};
