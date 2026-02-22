/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const { axios, authUser, onlineUsers, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(false);

  /* ===============================
     FETCH USERS
  =============================== */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("/api/messages/users");
        if (data.success) {
          setUsers(data.users);
        }
      } catch (error) {
        console.error("Failed to load users:", error);
        toast.error("Failed to load users");
      }
    };

    fetchUsers();
  }, [axios]);

  /* ===============================
     FILTER USERS
  =============================== */
  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      {/* ================= TOP SECTION ================= */}
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />

          {/* MENU */}
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

                <p
                  onClick={logout}
                  className="cursor-pointer text-sm hover:text-red-400"
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SEARCH */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search User..."
            className="bg-transparent border-none outline-none text-white text-xs placeholder:text-gray-400 flex-1"
          />
        </div>
      </div>

      {/* ================= USERS LIST ================= */}
      <div className="flex flex-col">
        {filteredUsers.length === 0 ? (
          <p className="text-xs text-gray-400 px-2">No users found</p>
        ) : (
          filteredUsers.map((user) => {
            const isOnline = onlineUsers?.includes(user._id);
            const isSelected = selectedUser?._id === user._id;

            return (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`relative flex items-center gap-3 p-3 pl-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected ? "bg-[#282142]/60" : "hover:bg-[#282142]/40"
                }`}
              >
                {/* PROFILE IMAGE */}
                <div className="relative">
                  <img
                    src={user.profilePic || assets.avatar_icon}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#1e1b2e] rounded-full ${
                      isOnline ? "bg-green-500" : "bg-gray-500"
                    }`}
                  ></span>
                </div>

                {/* USER INFO */}
                <div className="flex flex-col leading-5">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <span
                    className={`text-xs ${
                      isOnline ? "text-green-400" : "text-neutral-400"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
