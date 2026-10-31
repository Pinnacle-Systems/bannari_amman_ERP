import ProformaInvoiceApi from "../uniformService/ProformaInvoiceService";
import YarnProformaInvoiceApi from "../uniformService/YarnProformaInvoiceService";
import ProcessMasterApi from "../services/ProcessMasterService";
import store from "../store";

export const invalidateOrderEntryModule = () => {
  store.dispatch(ProformaInvoiceApi.util.invalidateTags(["proformaInvoice"]));
  store.dispatch(
    YarnProformaInvoiceApi.util.invalidateTags(["yarnProformaInvoice"]),
  );
  store.dispatch(ProcessMasterApi.util.invalidateTags(["Process"]));
};
