const UserSkeleton = () => {
  return (

    <div className="flex items-center justify-between bg-white px-5 py-4 rounded-2xl shadow-sm animate-pulse">

      <div className="flex items-center gap-4">

        <div className="h-14 w-14 bg-gray-300 rounded-full"></div>

        <div className="space-y-2">

          <div className="h-3 w-24 bg-gray-300 rounded"></div>

          <div className="h-2 w-16 bg-gray-200 rounded"></div>

        </div>

      </div>

      <div className="h-8 w-20 bg-gray-300 rounded-full"></div>

    </div>

  );
};

export default UserSkeleton;