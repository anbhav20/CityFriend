import { useRef } from "react";
import { FiCamera } from "react-icons/fi";

const ProfileAvatar = ({ src, editable = false, onChange }) => {
  const fileRef = useRef(null);

  const handleClick = () => {
    if (editable) fileRef.current?.click();
  };

  return (
    <div
      className={`relative ${editable ? "cursor-pointer group" : ""}`}
      onClick={handleClick}
    >
      <img
        src={src || "/default-avatar.png"}
        alt="avatar"
        className="h-24 w-24 rounded-full object-cover ring-2 ring-gray-200"
      />

      {editable && (
        <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <FiCamera size={20} className="text-white" />
        </div>
      )}

      {editable && (
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && onChange) onChange(file);
            e.target.value = "";
          }}
        />
      )}
    </div>
  );
};

export default ProfileAvatar;