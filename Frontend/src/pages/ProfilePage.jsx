import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";

const ProfilePage = () => {
  const { axios, authUser, setAuthUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // eslint-disable-next-line no-unused-vars
  const [selectedImg, setSelectedImg] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  /* ===============================
     LOAD USER DATA
  =============================== */
  useEffect(() => {
    if (authUser) {
      setName(authUser.fullName || "");
      setBio(authUser.bio || "");
      setPreview(authUser.profilePic || null);
    }
  }, [authUser]);

  /* ===============================
     IMAGE CHANGE
  =============================== */
  const handleImageChange = (file) => {
    setSelectedImg(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /* ===============================
     UPDATE PROFILE
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { data } = await axios.put("/api/users/update-profile", {
        fullName: name,
        bio,
        profilePic: preview, // base64 string
      });

      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully ✨");
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white bg-cover bg-no-repeat flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-lg font-semibold">Profile Details</h3>

          {/* IMAGE UPLOAD */}
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
              onChange={(e) => handleImageChange(e.target.files[0])}
            />

            <img
              src={preview || assets.avatar_icon}
              className="w-14 h-14 rounded-full object-cover"
              alt="avatar"
            />

            <span className="text-sm text-gray-300">Upload Profile Image</span>
          </label>

          {/* NAME */}
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Your Name"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-transparent"
            required
          />

          {/* BIO */}
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            rows={4}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-transparent"
            placeholder="Provide a short bio..."
            required
          ></textarea>

          {/* SAVE BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer hover:opacity-90 transition"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* RIGHT SIDE LOGO */}
        <img
          className="max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10"
          src={assets.logo_icon}
          alt="logo"
        />
      </div>
    </div>
  );
};

export default ProfilePage;
