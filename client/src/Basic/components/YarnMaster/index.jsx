import { useCallback, useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Check, Power } from "lucide-react";
import {
  FxSelectWithAdd,
  ReusableTable,
  TextInputNew,
  ToggleButton,
} from "../../../Inputs";
import Modal from "../../../UiComponents/Modal";
import { statusDropdown } from "../../../Utils/DropdownData";
import {
  useAddYarnMasterMutation,
  useDeleteYarnMasterMutation,
  useGetYarnMasterByIdQuery,
  useGetYarnMasterQuery,
  useUpdateYarnMasterMutation,
} from "../../../redux/services/YarnMasterService";
import { useGetCountsMasterQuery } from "../../../redux/services/CountsMaster.service";
import { useGetContentMasterQuery } from "../../../redux/services/contentMasterService";
import { useGetYarnBlendMasterQuery } from "../../../redux/services/YarnBlenMasterService";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";

import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";
import { UserPermissions } from "../../../Utils/UserPermissions";
import { DropdownWithModal } from "../../../Inputs/Reuseable";
import { dropDownListObject } from "../../../Utils/contructObject";
import CountsMaster from "../CountsMaster";
import ContentMaster from "../ContentMaster";
import { YarnBlendMaster } from "..";
import { HsnMaster } from "../../../HostelStore/Components";

export default function YarnMaster({ onSuccess, defaultName = "" } = {}) {
  const [form, setForm] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [countsId, setCountsId] = useState("");
  const [contentId, setContentId] = useState("");
  const [name, setName] = useState(defaultName || "");
  const [aliasName, setAliasName] = useState("");
  const [hsnId, setHsnId] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("");
  const [active, setActive] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);

  const [yarnMasterDetail, setYarnMasterDetails] = useState([]);
  const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();
  const firstGridInputRef = useRef(null);

  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
  };

  const { data: countsData, isFetching: isCountsFetching } =
    useGetCountsMasterQuery({ params });
  const { data: contentData, isFetching: isContentFetching } =
    useGetContentMasterQuery({ params });
  const { data: yarnBlendData, isFetching: isYarnBlendFetching } =
    useGetYarnBlendMasterQuery({ params });
  const { data: hsnList } = useGetHsnMasterQuery({ params });

  useEffect(() => {
    if (hsnId && hsnList?.data) {
      const selectedHsn = hsnList.data.find((item) => item.id === hsnId);
      if (selectedHsn) {
        setTaxPercentage(selectedHsn.tax);
      }
    } else {
      setTaxPercentage("");
    }
  }, [hsnId, hsnList]);

  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetYarnMasterQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetYarnMasterByIdQuery(id, { skip: !id });

  const [addData] = useAddYarnMasterMutation();
  const [updateData] = useUpdateYarnMasterMutation();
  const [removeData] = useDeleteYarnMasterMutation();
  const [dispatchInvalidate] = useInvalidateTags();

  const { hasPermission } = UserPermissions();
  const handleCreate = () => {
    hasPermission(() => {
      setForm(true);
      onNew();
    }, "create");
  };

  const syncFormWithDb = useCallback(
    (data) => {
      setCountsId(data?.countsId || "");
      setContentId(data?.contentId || "");
      setName(data?.name || defaultName || "");
      setHsnId(data?.hsnId || "");
      setAliasName(data?.aliasName || "");
      setActive(id ? (data?.active ? data.active : false) : true);
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
      const existingDetails =
        data?.yarnMasterDetail || data?.YarnMasterDetail || [];
      const paddedDetails = [...existingDetails];
      while (paddedDetails.length < 5) {
        paddedDetails.push({
          yarnBlendId: "",
          percentage: null,
        });
      }
      const mappedData = paddedDetails?.map((item) => ({
        ...item,
        percentage: item.percentage ? item.percentage?.toFixed(2) : null,
      }));
      setYarnMasterDetails(mappedData);
    },
    [id],
  );

  useEffect(() => {
    if (id && singleData?.data) {
      syncFormWithDb(singleData.data);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    id,
    countsId: parseInt(countsId),
    contentId: parseInt(contentId),
    name,
    aliasName,
    hsnId: parseInt(hsnId),
    yarnMasterDetail: yarnMasterDetail?.filter((item) => item.yarnBlendId),
    active,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
  };

  const validateData = (data) => {
    if (!data.countsId) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Counts is mandatory.",
      });
      return false;
    }
    if (!data.contentId) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Content is mandatory.",
      });
      return false;
    }
    if (!data.name) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Name is mandatory.",
      });
      return false;
    }
    if (!data.hsnId) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "HSN is mandatory.",
      });
      return false;
    }

    if (!data.yarnMasterDetail || data.yarnMasterDetail.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please add at least one Yarn Blend.",
      });
      return false;
    }

    if (data.yarnMasterDetail && data.yarnMasterDetail.length > 0) {
      const hasMissingPercentage = data.yarnMasterDetail.some(
        (row) => row.yarnBlendId && (!row.percentage || row.percentage === ""),
      );
      if (hasMissingPercentage) {
        Swal.fire({
          icon: "warning",
          title: "Validation Error",
          text: "Percentage is mandatory for all selected Yarn Blends.",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData = await callback(data).unwrap();
      if (onSuccess) {
        await Swal.fire({
          title: text + "  " + "Successfully",
          icon: "success",
        });
        onSuccess(returnData.data.id);
        return;
      }

      if (nextProcess == "new") {
        syncFormWithDb(undefined);
        setId("");
        onNew();

        countryNameRef?.current?.focus();
      } else {
        setForm(false);
        syncFormWithDb(undefined);
        setId("");
      }
      Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
        // draggable: true,
        // timer: 1000,
        // showConfirmButton: false,
        // didOpen: () => {
        //     Swal.showLoading();
        // }
      });
      dispatchInvalidate();
    } catch (error) {
      console.log("handle");
    }
  };

  const saveData = (nextProcess) => {
    if (!validateData(data)) {
      return;
    }
    let foundItem;
    if (id) {
      foundItem = allData?.data
        ?.filter((i) => i.id != id)
        ?.some((item) => item.name === name);
    } else {
      foundItem = allData?.data?.some((item) => item.name === name);
    }

    if (foundItem) {
      Swal.fire({
        text: "The Yarn Name already exists.",
        icon: "warning",
        didClose: () => {
          countryNameRef?.current?.focus();
        },
      });
      return false;
    }
    if (id) {
      if (!window.confirm("Are you sure update the details ...?")) {
        return;
      }
    }
    if (id) {
      handleSubmitCustom(
        updateData,
        { id, body: data },
        "Updated",
        nextProcess,
      );
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
    }
  };

  const deleteData = async (id, childRecord) => {
    if (childRecord) {
      Swal.fire({
        icon: "error",
        title: "Child record Exists",
      });
      return;
    }
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        await removeData(id);
        setId("");
        dispatchInvalidate();

        // toast.success("Deleted Successfully");
        Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
        });
        setForm(false);
        syncFormWithDb(undefined);
      } catch (error) {
        toast.error("something went wrong");
      }
    }
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  const onNew = () => {
    setId("");
    setCountsId("");
    setContentId("");
    setName("");
    setAliasName();
    setActive(true);
    setHsnId("");
    setTaxPercentage("");
    setYarnMasterDetails((prev) => {
      let newArray = Array?.from({ length: 5 - prev?.length }, () => {
        return {
          yarnBlendId: "",
          percentage: null,
        };
      });
      return [...prev, ...newArray];
    });
    setForm(true);
    setSearchValue("");
    syncFormWithDb(undefined);
    setReadOnly(false);
  };
  useEffect(() => {
    if (yarnMasterDetail?.length >= 1) return;
    setYarnMasterDetails((prev) => {
      let newArray = Array?.from({ length: 5 - prev?.length }, () => {
        return {
          yarnBlendId: "",
          percentage: null,
        };
      });
      return [...prev, ...newArray];
    });
  }, [yarnMasterDetail, setYarnMasterDetails]);
  const handleInputChange = (value, index, field, isFinal = false) => {
    const newBlend = structuredClone(yarnMasterDetail);
    newBlend[index][field] = value;

    const currentRow = newBlend[index];
    if (isFinal) {
      if (
        currentRow.yarnBlendId &&
        currentRow.percentage !== null &&
        currentRow.percentage !== ""
      ) {
        const isDuplicate = newBlend.some(
          (row, i) =>
            i !== index &&
            row.yarnBlendId === currentRow.yarnBlendId &&
            Number(row.percentage) === Number(currentRow.percentage),
        );

        if (isDuplicate) {
          Swal.fire({
            icon: "warning",
            title: "Duplicate Entry",
            text: "The exact same Yarn Blend and Percentage combination already exists.",
          });
          newBlend[index][field] = "";
          setYarnMasterDetails(newBlend);
          return;
        }

        const totalPercentage = newBlend.reduce(
          (sum, row) => sum + (Number(row.percentage) || 0),
          0
        );

        if (totalPercentage > 100) {
          Swal.fire({
            icon: "warning",
            title: "Validation Error",
            text: "The total percentage of all Yarn Blends cannot exceed 100.",
          });
          newBlend[index][field] = "";
          setYarnMasterDetails(newBlend);
          return;
        }
      }
    }

    setYarnMasterDetails(newBlend);
  };
  const addNewRow = () => {
    const newRow = {
      yarnBlendId: "",
      percentage: null,
    };
    setYarnMasterDetails([...yarnMasterDetail, newRow]);
  };
  const handleDeleteRow = (index) => {
    setYarnMasterDetails((prev) => {
      const updated = structuredClone(prev);

      // Remove the selected row
      updated.splice(index, 1);

      // If length falls below 15, append a new empty row to maintain the 15 minimum
      if (updated.length < 5) {
        updated.push({
          yarnBlendId: "",
          percentage: null,
        });
      }

      return updated;
    });
  };
  const handleDeleteAllRows = () => {
    setYarnMasterDetails(
      Array.from({ length: 5 }, () => ({
        yarnBlendId: "",
        percentage: null,
      })),
    );
  };
  const handleRightClick = (event, rowIndex, type) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      rowId: rowIndex,
      type,
    });
  };
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const ACTIVE = (
    <div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );
  const INACTIVE = (
    <div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );

  const columns = [
    {
      header: "S.No",
      accessor: (item, index) => index + 1,
      className: "font-medium text-gray-900 w-12  text-center",
    },

    {
      header: "Yarn Name",
      accessor: (item) => item?.name,
      //   cellClass: () => "font-medium  text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-72",
    },

    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-center uppercase w-16",
    },
  ];

  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
    console.log("view");
  };
  const handleEdit = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(false);
    console.log("Edit");
  };

  const {
    firstInputRef: countryNameRef,
    toggleButtonRef,
    saveCloseButtonRef,
    saveNewButtonRef,
  } = refs;

  const formBody = (
    <div className="flex-1 p-3">
      <div className="grid grid-cols-1  gap-3  h-full">
        <div className="lg:col-span- space-y-3">
          <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
            <div className="space-y-4 ">
              <fieldset className=" rounded mt-2">
                <div className="flex gap-x-4 my-2">
                  <div className="w-[25%]">
                    <DropdownWithModal
                      name="Counts Name"
                      options={dropDownListObject(
                        id
                          ? countsData?.data
                          : countsData?.data?.filter((item) => item?.active),
                        "name",
                        "id",
                      )}
                      value={countsId}
                      setValue={setCountsId}
                      required={true}
                      readOnly={readOnly}
                      className={`w-[150px]`}
                      disabled={childRecord.current > 0}
                      addNewLabel="+ Add New Counts"
                      childComponent={CountsMaster}
                      addNewModalWidth="w-[40%] h-[45%]"
                      ref={countryNameRef}
                    />
                  </div>
                  <div className="w-[40%]">
                    <DropdownWithModal
                      name="Content Name"
                      options={dropDownListObject(
                        id
                          ? contentData?.data
                          : contentData?.data?.filter((item) => item?.active),
                        "name",
                        "id",
                      )}
                      value={contentId}
                      setValue={setContentId}
                      required={true}
                      readOnly={readOnly}
                      className={`w-[150px]`}
                      disabled={childRecord.current > 0}
                      addNewLabel="+ Add New Content"
                      childComponent={ContentMaster}
                      addNewModalWidth="w-[40%] h-[45%]"
                    />
                  </div>
                  <div className="w-[50%]">
                    <TextInputNew
                      name="Yarn Name"
                      type="text"
                      value={name}
                      setValue={setName}
                      required={true}
                      readOnly={readOnly}
                      disabled={childRecord.current > 0}
                    />
                  </div>
                  <div className="w-[50%]">
                    <TextInputNew
                      name="Yarn Alias Name"
                      type="text"
                      value={aliasName}
                      setValue={setAliasName}
                      readOnly={readOnly}
                      disabled={childRecord.current > 0}
                    />
                  </div>
                  <ToggleButton
                    name="Status"
                    options={statusDropdown}
                    value={active}
                    setActive={setActive}
                    required={true}
                    readOnly={readOnly}
                    ref={toggleButtonRef}
                    onKeyDown={handlers.handleToggleKeyDown}
                  />
                </div>
                <div className="flex gap-x-4">
                  <div className="w-[15%] mb-3">
                    <DropdownWithModal
                      name="Hsn"
                      options={dropDownListObject(
                        id
                          ? hsnList?.data
                          : hsnList?.data?.filter((item) => item?.active),
                        "name",
                        "id",
                      )}
                      value={hsnId}
                      setValue={setHsnId}
                      readOnly={readOnly}
                      className={`w-[150px]`}
                      disabled={childRecord.current > 0}
                      addNewLabel="+ Add New Hsn"
                      childComponent={HsnMaster}
                      addNewModalWidth="w-[40%] h-[50%]"
                      required={true}
                    />
                  </div>
                  <div className="w-[10%]">
                    <TextInputNew
                      name="Tax percentage %"
                      type="text"
                      value={taxPercentage}
                      setValue={setTaxPercentage}
                      readOnly={true}
                      disabled={true}
                    />
                  </div>
                </div>
                <div className="h-full flex flex-col -ml-4 -mt-3">
                  <div className="flex-1 overflow-auto p-2">
                    <div className="grid grid-cols-1 gap-1 h-full">
                      <div className="space-y-3">
                        <div className="bg-white p-2 rounded-md w-[30vw] border border-gray-200 h-full">
                          <div
                            className={`w-full  overflow-auto bg-white h-[23vh]`}
                          >
                            <table className="w-full  border-collapse table-fixed ">
                              <thead className="bg-gray-200 text-gray-800">
                                <tr>
                                  <th
                                    className={`w-4  py-2 text-center font-medium text-[11px] `}
                                  >
                                    S.No
                                  </th>
                                  <th
                                    className={`w-28 py-2 text-center font-medium text-[11px] `}
                                  >
                                    Yarn Blend
                                  </th>
                                  <th
                                    className={`w-8 py-2 text-center font-medium text-[11px] `}
                                  >
                                    Percentage
                                  </th>
                                </tr>
                              </thead>
                              <tbody
                                onKeyDown={(e) => {
                                  if (e.key === "Tab") {
                                    e.preventDefault();
                                    saveCloseButtonRef.current?.focus();
                                  }
                                }}
                              >
                                {yarnMasterDetail?.map((val, index) => {
                                  return (
                                    <tr
                                      key={index}
                                      className=" w-full table-row-second "
                                    >
                                      <td className="border  border-gray-300 text-[12px]  text-center px-1">
                                        {index + 1}
                                      </td>
                                      <td className="grid-editable-cell border border-gray-300 text-[12px] py-1 item-center">
                                        <FxSelectWithAdd
                                          ref={
                                            index === 0
                                              ? firstGridInputRef
                                              : null
                                          }
                                          value={val.yarnBlendId}
                                          onChange={(val) =>
                                            handleInputChange(
                                              val,
                                              index,
                                              "yarnBlendId",
                                              true,
                                            )
                                          }
                                          options={(yarnBlendData?.data || [])
                                            .filter((i) =>
                                              id ? true : i.active,
                                            )
                                            .map((i) => ({
                                              label: i.name,
                                              value: i.id,
                                            }))}
                                          readOnly={
                                            readOnly || childRecord?.current > 0
                                          }
                                          placeholder=""
                                          addNew={true}
                                          childComponent={YarnBlendMaster}
                                          addNewModalWidth="w-[38%] h-[50%]"
                                          // nextRef={requirementRef}
                                        />
                                      </td>

                                      <td className="grid-editable-cell border border-gray-300 text-[12px] py-0.5 item-center ">
                                        <input
                                          type="number" // enforce proper format
                                          value={val?.percentage || ""}
                                          onFocus={(e) => e.target.select()}
                                          onChange={(e) =>
                                            handleInputChange(
                                              e.target.value,
                                              index,
                                              "percentage",
                                              false,
                                            )
                                          }
                                          onBlur={(e) => {
                                            if (e.target.value) {
                                              handleInputChange(
                                                Number(e.target.value).toFixed(
                                                  2,
                                                ),
                                                index,
                                                "percentage",
                                                true,
                                              );
                                            }
                                          }}
                                          onContextMenu={(e) => {
                                            if (!readOnly) {
                                              handleRightClick(
                                                e,
                                                index,
                                                "percentage",
                                              );
                                            }
                                          }}
                                          onKeyDown={(e) => {
                                            if (
                                              e.key === "Enter" &&
                                              !readOnly
                                            ) {
                                              if (
                                                index ===
                                                yarnMasterDetail.length - 1
                                              ) {
                                                addNewRow();
                                              }
                                            }
                                          }}
                                          spellCheck={false}
                                          className={`w-full bg-transparent uppercase  pr-2 text-right focus:outline-none focus:border-transparent   ${
                                            readOnly || childRecord.current > 0
                                              ? "text-gray-600"
                                              : "text-black"
                                          }`}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if ((form || onSuccess) && countryNameRef.current) {
      countryNameRef.current.focus();
    }
  }, [form, onSuccess]);

  if (onSuccess) {
    return (
      <div
        onKeyDown={handleKeyDown}
        className="h-full flex flex-col bg-gray-200"
      >
        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
          <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
            Add New Yarn Master
          </h2>
          <button
            type="button"
            onClick={() => saveData("close")}
            ref={saveCloseButtonRef}
            onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
            className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 border border-blue-600 flex items-center gap-1 text-xs"
          >
            <Check size={14} />
            {"Save"}
          </button>
        </div>

        {formBody}
      </div>
    );
  }

  return (
    <div onKeyDown={handleKeyDown} className="p-1 h-[87%]">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-lg font-bold text-gray-800">Yarn Master</h5>
        <div className="flex items-center">
          <button
            onClick={handleCreate}
            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-xs px-2 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Yarn Master
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3 ">
        <ReusableTable
          columns={columns}
          data={allData?.data}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={deleteData}
          itemsPerPage={10}
        />
      </div>

      <div>
        {form === true && (
          <Modal
            isOpen={form}
            form={form}
            widthClass={"w-[75vw] h-[68vh]"}
            onClose={() => {
              setForm(false);
              syncFormWithDb(undefined);
              setId("");
              // setErrors({});
            }}
          >
            <div className="h-full flex flex-col bg-gray-200">
              <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                    {id
                      ? !readOnly
                        ? "Edit Yarn Master"
                        : "Yarn Master"
                      : "Add New Yarn Master"}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <div>
                    {readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm(false);
                          setSearchValue("");
                          setId(false);
                        }}
                        className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          saveData("close");
                        }}
                        className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 
                  border border-blue-600 flex items-center gap-1 text-xs"
                        ref={saveCloseButtonRef} // ✅ Add ref
                        tabIndex={0}
                        onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
                      >
                        <Check size={14} />
                        {id ? "Update" : "Save & close"}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!readOnly && !id && (
                      <button
                        type="button"
                        onClick={() => {
                          saveData("new");
                        }}
                        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs"
                        onKeyDown={handlers.handleSaveNewKeyDown(saveData)}
                        ref={saveNewButtonRef} // ✅ Add ref
                        tabIndex={0}
                      >
                        <Check size={14} />
                        {"Save & New"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {formBody}
            </div>
            {contextMenu && (
              <div
                style={{
                  position: "absolute",
                  top: `${contextMenu.mouseY - 50}px`,
                  left: `${contextMenu.mouseX - 30}px`,

                  // background: "gray",
                  boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                  padding: "8px",
                  borderRadius: "4px",
                  zIndex: 1000,
                }}
                className="bg-gray-100"
                onMouseLeave={handleCloseContextMenu} // Close when the mouse leaves
              >
                <div className="flex flex-col gap-1">
                  <button
                    className=" text-black text-[12px] text-left rounded px-1"
                    onClick={() => {
                      handleDeleteRow(contextMenu.rowId);
                      handleCloseContextMenu();
                    }}
                  >
                    Delete{" "}
                  </button>
                  <button
                    className=" text-black text-[12px] text-left rounded px-1"
                    onClick={() => {
                      handleDeleteAllRows();
                      handleCloseContextMenu();
                    }}
                  >
                    Delete All
                  </button>
                </div>
              </div>
            )}
          </Modal>
        )}
      </div>
    </div>
  );
}
