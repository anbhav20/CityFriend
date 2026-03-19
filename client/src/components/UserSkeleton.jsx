const UserSkeleton = () => {
  return (
    <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm animate-pulse max-w-xl mx-auto">

      <div className="flex items-center gap-2.5 sm:gap-3">

        <div className="h-9 w-9 sm:h-11 sm:w-11 bg-gray-300 rounded-full"></div>

        <div className="space-y-1.5">
          <div className="h-2.5 sm:h-3 w-20 sm:w-24 bg-gray-300 rounded"></div>
          <div className="h-2 w-14 sm:w-16 bg-gray-200 rounded"></div>
        </div>

      </div>

      <div className="h-6 sm:h-8 w-16 sm:w-20 bg-gray-300 rounded-full"></div>

    </div>
  );
};

export default UserSkeleton;