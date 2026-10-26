import { useDispatch } from "react-redux";
import { getCommonParams } from "../../../Utils/helper.js";
import { useGetTermsandCondtionsQuery } from "../../../redux/uniformService/TermsAndContionService.js";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService.js";
import { useDeleteSalesDeliveryMutation } from "../../../redux/uniformService/SalesDeliveryService.js";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService.js";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService.js";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import SalesReturnReport from "./SalesReturnReport.jsx";
import SalesReturnForm from "./SalesRetun.jsx";
import Swal from "sweetalert2";
import { useGetPaytermMasterQuery } from "../../../redux/services/payTermMasterService.js";
import { UserPermissions } from "../../../Utils/UserPermissions.js";
import useInvalidateTags from '../../../CustomHooks/useInvalidateTags.js';
import { useDeleteSalesReturnMutation } from "../../../redux/services/SalesReturnService.js";
import ActiveTabsHeader from "../../../Basic/components/ActiveTabList/ActiveTabsHeader";

const SalesReturn = () => {
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const dispatch = useDispatch();
  const { branchId, companyId, finYearId, userId } = getCommonParams();
  const params = { branchId, companyId, finYearId };

  const { data: termsData } = useGetTermsandCondtionsQuery({ params });
  const { data: payTermList } = useGetPaytermMasterQuery({ params });
  const { data: userData } = useGetUserByIdQuery(userId);
  const { hasPermission } = UserPermissions();

  const handleView = (docId) => {
    setId(docId);
    setShowForm(true);
    setReadOnly(true);
  };

  const handleEdit = (docId) => {
    setId(docId);
    setShowForm(true);
    setReadOnly(false);
  };

  const [removeData] = useDeleteSalesReturnMutation();
  const [invalidateTagsDispatch] = useInvalidateTags();

  const handleDelete = async (id) => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) return;
      try {
        let deldata = await removeData(id).unwrap();


        if (deldata?.statusCode == 1) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: deldata.message || "Data cannot be deleted!",
          });
          return;
        }
        Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
          timer: 1000,
        });

        invalidateTagsDispatch()

      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Submission error",
          text: error.data?.message || "Something went wrong!",
        });
      }
    }
  };

  const onNew = () => {
    setId("");
    setReadOnly(false);
    setShowForm(true);
  };

  const { data: customerList } = useGetPartyQuery({ params: { ...params, isAddessCombined: true } });
  const { data: branchList } = useGetBranchQuery({ params: { ...params } });

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

        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 min-h-0">
          <SalesReturnReport
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            itemsPerPage={16}
            userData={userData?.data}
          />
        </div>
      </div>

      {showForm && (
        <div className="h-full flex-1 min-h-0 overflow-hidden">
          <SalesReturnForm
            readOnly={readOnly}
            setReadOnly={setReadOnly}
            id={id}
            setId={setId}
            onClose={() => setShowForm(false)}
            customerList={customerList}
            branchList={branchList?.data}
            userData={userData?.data}
            termsData={termsData}
            payTermList={payTermList}
            hasPermission={hasPermission}
            invalidateTagsDispatch={invalidateTagsDispatch}
          />
        </div>
      )}
    </div>
  );
};

export default SalesReturn;
