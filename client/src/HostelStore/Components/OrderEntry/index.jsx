import { useDispatch, useSelector } from "react-redux";
import { getCommonParams } from "../../../Utils/helper";
import { useGetTermsandCondtionsQuery } from "../../../redux/uniformService/TermsAndContionService";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService";
import { useDeleteOrderEntryMutation } from "../../../redux/uniformService/OrderEntryService";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService.js";
import {
  useGetBranchByIdQuery,
  useGetBranchQuery,
} from "../../../redux/services/BranchMasterService.js";
import { useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa";
import OrderEntryReport from "./OrderEntryReport.jsx";
import OrderEntryForm from "./OrderEntryForm.jsx";
import { useIsApprover } from "../../../CustomHooks/userIsApprover.js";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags.js";
import { UserPermissions } from "../../../Utils/UserPermissions.js";
import Swal from "sweetalert2";
import { useGetCityQuery } from "../../../redux/services/CityMasterService.js";
import { invalidateFabricModule } from "../../../redux/Dispatch/fabircInvalidateTags.js";
import { invalidateYarnModule } from "../../../redux/Dispatch/yarnInvalidateTags";
import { invalidateOrderEntryModule } from "../../../redux/Dispatch/OrderInvalidateTags.js";
import ActiveTabsHeader from "../../../Basic/components/ActiveTabList/ActiveTabsHeader";
const index = () => {
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [showJobCardForm, setShowJobCardForm] = useState(false);
  const { hasPermission } = UserPermissions();

  const openTabs = useSelector((state) => state.openTabs);
  const previewOrderId = useMemo(
    () => openTabs.tabs.find((i) => i.name === "ORDER ENTRY")?.previewId,
    [openTabs],
  );

  const dispatch = useDispatch();
  const { branchId, companyId, finYearId, userId } = getCommonParams();
  const params = {
    branchId,
    companyId,
    finYearId,
  };
  const {
    data: termsData,
    isLoading,
    isFetching,
  } = useGetTermsandCondtionsQuery({ params });
  const [dispatchInvalidate] = useInvalidateTags();

  const { data: userData } = useGetUserByIdQuery(userId);
  const { canApprove } = useIsApprover("ORDER ENTRY", userData?.data?.id);
  const { data: cityList } = useGetCityQuery({ params });

  const handleView = (orderId) => {
    setId(orderId);
    setShowForm(true);
    setReadOnly(true);
  };

  const handleEdit = (orderId) => {
    setId(orderId);
    setShowForm(true);
    setReadOnly(false);
  };
  const [removeData] = useDeleteOrderEntryMutation();
  const handleDelete = async (id) => {
    setId(id);
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }

      try {
        let deldata = await removeData(id).unwrap();
        invalidateFabricModule();
        invalidateYarnModule();
        invalidateOrderEntryModule();
        if (deldata?.statusCode == 1) {
          Swal.fire({
            icon: "error",
            title: "Child record Exists",
            text: deldata.data?.message || "Data cannot be deleted!",
          });
          return;
        }
        setId("");
        Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
          timer: 1000,
        });
        setShowForm(false);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Submission error",
          text: error.data?.message || "Something went wrong!",
        });
        setShowForm(false);
      }
    }
  };

  useEffect(() => {
    if (!previewOrderId) return;
    setId(previewOrderId);
    setShowForm(true);
  }, [previewOrderId]);

  const onNew = () => {
    setId("");
    setReadOnly(false);
  };

  const { data: customerList } = useGetPartyQuery({ params: { ...params } });
  const { data: branchList } = useGetBranchQuery({ params: { ...params } });
  const { data: branchData } = useGetBranchByIdQuery(branchId, {
    skip: !branchId,
  });
  const handleCreateJobCard = (orderId) => {
    setSelectedOrderId(orderId);
    setShowJobCardForm(true);
  };

  const handleCreate = () => {
    hasPermission(() => {
      setShowForm(true);
      onNew();
    }, "create");
  };

  return (
    <div className="p-1 bg-[#F1F1F0] h-full flex flex-col overflow-hidden">
      <div
        className="h-full flex flex-col overflow-hidden"
        style={{ display: showForm ? "none" : "flex" }}
      >
        <div className="w-full flex bg-white py-1 px-2 justify-between items-center rounded-md shadow-sm border border-gray-200 mb-2 flex-none h-[38px] min-h-[38px] max-h-[38px] relative z-30">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <ActiveTabsHeader />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 py-1 rounded-md flex items-center gap-2 text-xs px-2.5 shadow-sm font-medium transition cursor-pointer"
              onClick={handleCreate}
            >
              <FaPlus /> Create New
            </button>
          </div>
        </div>

        <div className="bg-[#F1F1F0] rounded-xl shadow-sm overflow-hidden flex-1 min-h-0">
          <OrderEntryReport
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            itemsPerPage={15}
            userData={userData?.data}
            onCreateJobCard={handleCreateJobCard}
            canApprove={canApprove}
          />
        </div>
      </div>

      {showForm && (
        <div className="h-full flex-1 min-h-0 overflow-hidden">
          <OrderEntryForm
            readOnly={readOnly}
            setReadOnly={setReadOnly}
            id={id}
            setId={setId}
            onClose={() => {
              setShowForm(false);
              setReadOnly((prev) => !prev);
            }}
            setShowForm={setShowForm}
            customerList={customerList}
            branchList={branchList}
            userData={userData?.data}
            termsData={termsData}
            canApprove={canApprove}
            branchData={branchData}
            hasPermission={hasPermission}
            cityList={cityList}
          />
        </div>
      )}
    </div>
  );
};

export default index;
