import "./Header.css";
import dp from "../../../assets/default-dp.png";
import { Bell, Search, LayoutDashboard } from "lucide-react";
import Profile from "./Profile";
import logo from "../../../assets/mplogo.png";
import bannariLogo from "../../../assets/bannarispintexlogo.jpeg";
// import { useState } from "react"
import { LogOut } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import Modal from "../../../UiComponents/Modal";
import { useNavigate } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService";
import { useGetPageGroupQuery } from "../../../redux/services/PageGroupMasterServices";
import MultiLevelDropDown from "../../../UiComponents/MultiSelectDropDown";
import { toast } from "react-toastify";
// import { useGetProjectQuery } from '../../../redux/services/ProjectService';
import axios from "axios";
import { PAGES_API, ROLES_API } from "../../../Api";
import AccountDetailsDropDown from "./AccountsDropDown";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { push } from "../../../redux/features/opentabs";
import Swal from "sweetalert2";
import Logout from "../../../Basic/components/LogoutConfirm";
import PageSearch from "./PageSearch";
import Notification from "./Notification";
import { GLOBE_ICON } from "../../../icons";
import useLogout from "../../../CustomHooks/useLogout";
const BASE_URL = process.env.REACT_APP_SERVER_URL;

const Header = ({ profile, setProfile, setIsGlobalOpen }) => {
  useLogout();

  const [logout, setLogout] = useState(false);
  const [hideNavBar, sethideNavBar] = useState(true);

  const navBatItemsStyle = hideNavBar ? "hidden" : "";

  const [allowedPages, setAllowedPages] = useState([]);

  const dispatch = useDispatch();

  const { data: pageGroup } = useGetPageGroupQuery({ searchParams: "" });

  const handleOutsideClick = () => {
    sethideNavBar(true);
  };

  const ref = useOutsideClick(handleOutsideClick);

  const toggleNavMenu = () => {
    sethideNavBar(!hideNavBar);
  };
  const id = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId",
  );
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetUserByIdQuery(id);

  const retrieveAllowedPages = useCallback(() => {
    const defaultAdminRaw = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "defaultAdmin",
    );

    let defaultAdmin = false;
    try {
      if (typeof defaultAdminRaw === "string") {
        defaultAdmin = JSON.parse(defaultAdminRaw);
      } else {
        defaultAdmin = defaultAdminRaw;
      }
    } catch (e) {
      console.error("Failed to parse defaultAdmin:", e);
      defaultAdmin = false;
    }
    if (defaultAdmin) {
      axios({
        method: "get",
        url: BASE_URL + PAGES_API,
        params: { active: true },
      }).then(
        (result) => {
          console.log("result", result.data.data);
          setAllowedPages(result.data.data);
        },
        (error) => {
          console.log(error);
          // toast.error("Server Down", { autoClose: 5000 });
          Swal.fire({
            title: "Server Down",
            icon: "error",
          });
        },
      );
    } else {
      axios({
        method: "get",
        url:
          BASE_URL +
          ROLES_API +
          `/${secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userRoleId",
          )}`,
      }).then(
        (result) => {
          if (result.status === 200) {
            if (result.data.statusCode === 0) {
              setAllowedPages(
                result.data.data.RoleOnPage.filter(
                  (page) => page.page.active && page.read,
                ).map((page) => {
                  return {
                    name: page.page.name,
                    type: page.page.type,
                    link: page.page.link,
                    id: page.page.id,
                    pageGroupId: page.page.pageGroupId,
                  };
                }),
              );
            }
          } else {
            console.log(result);
          }
        },
        (error) => {
          console.log(error);
          // toast.error("Server Down", { autoClose: 5000 });
          Swal.fire({
            title: "Server Down",
            icon: "error",
          });
        },
      );
    }
  }, []);
  useEffect(retrieveAllowedPages, [retrieveAllowedPages]);
  const userName = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "username",
  );

  function findElement(id, arr) {
    if (!arr) return "";
    let data = arr.find((item) => parseInt(item.id) === parseInt(id));
    return data ? data.name : "";
  }

  const masters = allowedPages.filter((page) => page.type === "Masters");
  const mastersGroup = [...new Set(masters.map((page) => page.pageGroupId))]
    .map((pageId) => {
      return {
        id: pageId,
        name: findElement(pageId, pageGroup?.data),
        type: "Masters",
      };
    })
    .filter((g) => g.name)
    .sort((a, b) => a.id - b.id);

  const transactions = allowedPages.filter(
    (page) => page.type === "Transactions",
  );
  const transactionsGroup = [
    ...new Set(transactions.map((page) => page.pageGroupId)),
  ]
    .map((pageId) => {
      return {
        id: pageId,
        name: findElement(pageId, pageGroup?.data),
        type: "Modules",
      };
    })
    .filter((g) => g.name);

  const order = [
    "APPROVAL",
    "ORDER",
    "PURCHASE",
    "PRODUCTION",
    "OUTSIDE PROCESS",
    "SALES",
    "PAYMENT",
  ];

  const sortedTransactionsGroup = [
    ...order
      .map((name) => transactionsGroup?.find((item) => item.name === name))
      .filter(Boolean),
    ...transactionsGroup.filter((item) => !order.includes(item.name)),
  ];

  const reports = allowedPages.filter((page) => page.type === "Reports");
  const reportGroups = [...new Set(reports.map((page) => page.pageGroupId))]
    .map((pageId) => {
      return { id: pageId, name: findElement(pageId, pageGroup?.data) };
    })
    .filter((g) => g.name);

  return (
    <div className="py-1 px-3 w-full flex justify-between items-center bg-white shadow-sm fixed z-50">
      <Modal
        isOpen={logout}
        onClose={() => {
          setLogout(false);
        }}
        widthClass={""}
      >
        <Logout setLogout={setLogout} />
      </Modal>

      {/* Left side: Logo & Navigation Items */}
      <div className="flex items-center space-x-1 lg:space-x-3">
        <div className="flex shrink-0 items-center mr-1">
          <img
            src={bannariLogo}
            alt="Bannari Spintex Logo"
            className="h-8 w-8 object-contain rounded"
          />
        </div>

        <button
          type="button"
          onClick={() => dispatch(push({ active: true, name: "DASHBOARD" }))}
          className="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
          title="Dashboard"
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <MultiLevelDropDown
          heading="Masters"
          groups={mastersGroup}
          pages={masters}
          textColor="text-gray-700 hover:text-blue-600"
        />

        <MultiLevelDropDown
          heading="Transactions"
          groups={sortedTransactionsGroup}
          pages={transactions}
          textColor="text-gray-700 hover:text-blue-600"
        />

        <MultiLevelDropDown
          heading="Reports"
          groups={reportGroups}
          pages={reports}
          textColor="text-gray-700 hover:text-blue-600"
        />
      </div>

      {/* Right side: Search, Globe, Profile */}
      <div className="mr-3 flex items-center space-x-4 text-sm">
        <div className="relative">
          <PageSearch pageList={allowedPages} />
        </div>
        <div
          className="text-lg cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => {
            setIsGlobalOpen(true);
          }}
          title="Branch & Financial Year"
        >
          {GLOBE_ICON}
        </div>
        {/* <Notification /> */}
        <p className="hidden md:inline text-gray-500 font-medium">WELCOME</p>
        <div className="text-black font-semibold hidden md:inline">
          {userName?.toUpperCase()}
        </div>
        <div className="relative text-left" ref={ref}>
          <button
            onClick={toggleNavMenu}
            type="button"
            className="md:bg-transparent inline-flex text-2xl justify-end items-center"
            id="menu-button"
            aria-expanded="true"
            aria-haspopup="true"
          >
            <img
              className="rounded-full cursor-pointer border-2 border-indigo-500 hover:ring-2 hover:ring-indigo-300 transition-all"
              width={"28px"}
              height={"28px"}
              src={dp}
              alt="image"
            />
          </button>

          {!hideNavBar && (
            <Profile
              dp={dp}
              setProfile={sethideNavBar}
              items={allowedPages.filter((page) => page.type === "AdminAccess")}
              setLogout={setLogout}
              logout={logout}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
