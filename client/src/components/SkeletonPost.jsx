const SkeletonPost = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm animate-pulse">

      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>

        <div className="space-y-2">
          <div className="h-3 w-24 bg-gray-300 rounded"></div>
          <div className="h-2 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div className="w-full h-80 bg-gray-300"></div>

      <div className="p-4">
        <div className="h-3 w-40 bg-gray-300 rounded"></div>
      </div>

    </div>
  );
};

export default SkeletonPost;