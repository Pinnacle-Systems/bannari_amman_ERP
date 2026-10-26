import React, { useState } from 'react'
import RolesMaster from './RolesMaster';
import UserMaster from './UserMaster';
import ActiveTabsHeader from '../ActiveTabList/ActiveTabsHeader';

const UserRoles = () => {
    const [activeNavBar, setActiveNavBar] = useState("Roles");

    const subMenus = [
        "Roles",
        "Users"
    ]

    const getShowSubMenu = () => {
        switch (activeNavBar) {
            case "Roles":
                return <RolesMaster />
            case "Users":
                return <UserMaster />
            default:
                return ""
        }
    }

    return (
        <div className='h-full flex flex-col'>
            <div className='md:flex md:items-center page-heading py-1 px-2 justify-between'>
                <div className="flex items-center gap-2 min-w-0 flex-1 overflow-x-auto">
                    <ActiveTabsHeader />
                </div>
            </div>
            <div className='row-span-6 grid grid-cols-8 flex-1'>
                <div className='border-2 bg-white'>
                    <div>
                        {subMenus.map((item, index) =>
                            <div key={index} onClick={() => setActiveNavBar(item)} className={`${activeNavBar === item ? "sub-navbar-active" : "sub-navbar"} text-center`}>{item}</div>
                        )}
                    </div>
                </div>
                <div className='col-span-7'>
                {getShowSubMenu()}
                </div>
            </div>
        </div>
    )
}

export default UserRoles

