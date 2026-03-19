const UserProfile = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl animate-pulse max-w-xl mx-auto px-4 sm:px-5 py-4 sm:py-6">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3 sm:gap-4">

          <div className="h-12 w-12 sm:h-14 sm:w-14 bg-gray-300 rounded-full"></div>

          <div className="space-y-2">
            <div className="h-3 sm:h-4 w-24 sm:w-28 bg-gray-300 rounded"></div>
            <div className="h-2 sm:h-3 w-16 sm:w-20 bg-gray-200 rounded"></div>
          </div>

        </div>

        <div className="h-7 sm:h-8 w-16 sm:w-20 bg-gray-300 rounded-full"></div>
      </div>
      {/* Bio Skeleton */}
      <div className="mt-4 space-y-2">
        <div className="h-2.5 w-full bg-gray-200 rounded"></div>
        <div className="h-2.5 w-4/5 bg-gray-200 rounded"></div>
      </div>

    </div>
  );
};

export default UserProfile;