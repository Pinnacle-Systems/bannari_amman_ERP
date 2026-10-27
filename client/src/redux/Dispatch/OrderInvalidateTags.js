import ProformaInvoiceApi from "../uniformService/ProformaInvoiceService";
import YarnProformaInvoiceApi from "../uniformService/YarnProformaInvoiceService";
import store from "../store";

export const invalidateOrderEntryModule = () => {
  store.dispatch(ProformaInvoiceApi.util.invalidateTags(["proformaInvoice"]));
  store.dispatch(
    YarnProformaInvoiceApi.util.invalidateTags(["yarnProformaInvoice"]),
  );
};
