import { useNavigate } from "react-router-dom";
import { useState } from "react";
import assets, { userDummyData } from "../assets/assets";

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      {/* Top Section */}
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />

          {/* Menu */}
          <div className="relative py-2">
            <img
              src={assets.menu_icon}
              alt="menu"
              className="max-h-5 cursor-pointer"
              onClick={() => setOpenMenu(!openMenu)}
            />

            {openMenu && (
              <div className="absolute top-full right-0 z-20 w-36 p-4 rounded-md bg-[#282142] border border-gray-600 text-gray-100">
                <p
                  onClick={() => {
                    navigate("/profile");
                    setOpenMenu(false);
                  }}
                  className="cursor-pointer text-sm hover:text-violet-400"
                >
                  Edit Profile
                </p>

                <hr className="my-2 border-gray-500" />

                <p className="cursor-pointer text-sm hover:text-red-400">
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            type="text"
            placeholder="Search User..."
            className="bg-transparent border-none outline-none text-white text-xs placeholder:text-gray-400 flex-1"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex flex-col">
        {userDummyData.map((user, index) => (
          <div
            key={index}
            onClick={() => setSelectedUser(user)}
            className={`relative flex items-center gap-3 p-3 pl-4 rounded-lg cursor-pointer transition-all duration-200
              ${
                selectedUser?._id === user._id
                  ? "bg-[#282142]/60"
                  : "hover:bg-[#282142]/40"
              }`}
          >
            <img
              src={user?.profilePic || assets.avatar_icon}
              alt="Profile"
              className="w-9 aspect-square rounded-full object-cover"
            />

            <div className="flex flex-col leading-5">
              <p>{user.fullName}</p>
              {index < 3 ? (
                <span className="text-green-400 text-xs">Online</span>
              ) : (
                <span className="text-neutral-400 text-xs">Offline</span>
              )}
            </div>

            {index > 2 && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {index}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
