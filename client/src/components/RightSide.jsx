import SocialIcons from "./SocialIcons";

const RightSide = () => {
  return (
    <aside className="fixed right-0 top-0 h-screen w-60 bg-white border-l border-gray-100 flex flex-col px-5 py-7 z-40">

      {/* Stay Connected */}
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">
          Stay Connected
        </p>
        <div className="flex gap-3">
          <SocialIcons />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="border-t border-gray-100 pt-5 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} CityFriend
        <span className="block mt-1">Made with ❤️ by Anbhav's Team</span>
      </div>

    </aside>
  );
};

export default RightSide;