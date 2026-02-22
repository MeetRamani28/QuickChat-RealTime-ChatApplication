import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSideBar from "../components/RightSideBar";

const HomePage = () => {
  // eslint-disable-next-line no-unused-vars
  const { authUser } = useContext(AuthContext);

  // Store full selected user object
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="w-full h-screen sm:px-[10%] sm:py-[3%] bg-linear-to-br from-[#0f172a] to-[#1e293b] text-white">
      <div
        className={`backdrop-blur-xl border border-gray-700 rounded-2xl overflow-hidden h-full grid transition-all duration-300 ${
          selectedUser
            ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
            : "md:grid-cols-2"
        }`}
      >
        {/* ================= SIDEBAR ================= */}
        <Sidebar
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />

        {/* ================= CHAT AREA ================= */}
        <ChatContainer
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />

        {/* ================= RIGHT SIDEBAR ================= */}
        {selectedUser && (
          <RightSideBar
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
