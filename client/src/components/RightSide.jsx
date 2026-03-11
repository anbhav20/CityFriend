import SocialIcons from "./SocialIcons"
const RightSide = () => {
    const RIGHT_WIDTH = "w-60"; 
  return ( <div
        className={`
          ${RIGHT_WIDTH}
          hidden lg:flex
          fixed right-0 top-0 h-screen
          flex-col justify-between
          bg-gray-200
          border-l border-gray-200
          px-6 py-8
        `}
      >
        {/* Social Icons */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Stay Connected!!
          </h3>

          <div className="flex gap-4">
            <SocialIcons />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 border-t pt-6">
          © {new Date().getFullYear()} CityFriend
          <span className="block mt-1">
            Made with ❤️ by Anbhav’s Team
          </span>
        </div>
      </div>  
      
    )
}

export default RightSide