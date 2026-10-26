import React, { useState } from 'react'
import BranchIdSettings from './BranchIdSettings';
import Packing from './Packing';
import ActiveTabsHeader from '../ActiveTabList/ActiveTabsHeader';

const UserRoles = () => {
    const [activeNavBar, setActiveNavBar] = useState("Id Card Settings");

    const subMenus = [
        "Id Card Settings",
        "Packing",

    ]

    const getShowSubMenu = () => {
        switch (activeNavBar) {
            case "Id Card Settings":
                return <BranchIdSettings />
            case "Packing":
                return <Packing />
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
            <div className='row-span-6 grid grid-cols-8 overflow-clip flex-1'>
                <div className='border-2 bg-white'>
                    <div>
                        {subMenus.map((item, index) =>
                            <div key={index} onClick={() => setActiveNavBar(item)} className={`${activeNavBar === item ? "sub-navbar-active" : "sub-navbar"} text-center cursor-pointer`}>{item}</div>
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

