/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const RightSideBar = ({ selectedUser }) => {
  const { axios, logout, onlineUsers } = useContext(AuthContext);

  const [media, setMedia] = useState([]);
  const isOnline = onlineUsers?.includes(selectedUser?._id);

  /* ===============================
     FETCH MEDIA (IMAGES FROM CHAT)
  =============================== */
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        if (!selectedUser) return;

        const { data } = await axios.get(`/api/messages/${selectedUser._id}`);

        if (data.success) {
          const images = data.messages
            .filter((msg) => msg.image)
            .map((msg) => msg.image);

          // Show latest media first
          setMedia(images.reverse());
        }
      } catch (error) {
        console.error("Failed to fetch media:", error);
        toast.error("Failed to load media");
      }
    };

    fetchMedia();
  }, [selectedUser]);

  if (!selectedUser) return null;

  return (
    <div className="bg-[#8185B2]/10 text-white w-full pb-6 relative h-full overflow-y-auto max-md:hidden">
      {/* ================= PROFILE ================= */}
      <div className="pt-12 flex flex-col items-center gap-3 text-sm font-light px-6 text-center">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          className="w-24 h-24 rounded-full object-cover border border-gray-600"
          alt="avatar"
        />

        <h1 className="text-xl font-medium flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-green-500" : "bg-gray-500"
            }`}
          ></span>
          {selectedUser.fullName}
        </h1>

        <p className="text-gray-300 text-sm">
          {selectedUser.bio || "No bio available"}
        </p>
      </div>

      <hr className="border-[#ffffff30] my-6" />

      {/* ================= MEDIA SECTION ================= */}
      <div className="px-6 text-sm">
        <p className="font-medium mb-3">Media</p>

        {media.length === 0 ? (
          <p className="text-gray-400 text-xs">No media shared yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {media.map((url, index) => (
              <div
                key={index}
                onClick={() => window.open(url)}
                className="cursor-pointer"
              >
                <img
                  src={url}
                  alt="shared media"
                  className="rounded-md object-cover w-full h-24"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= LOGOUT BUTTON ================= */}
      <button
        onClick={logout}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-sm py-2 px-16 rounded-full hover:opacity-90 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default RightSideBar;
