const SkeletonPost = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse max-w-xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">

        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full"></div>

        <div className="space-y-1.5">
          <div className="h-2.5 sm:h-3 w-20 sm:w-24 bg-gray-300 rounded"></div>
          <div className="h-2 w-14 sm:w-16 bg-gray-200 rounded"></div>
        </div>

      </div>

      {/* Image Skeleton */}
      <div className="w-full h-64 sm:h-80 bg-gray-300"></div>

      {/* Actions */}
      <div className="flex gap-4 px-3 sm:px-4 py-2.5 sm:py-3">

        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 rounded"></div>
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 rounded"></div>

      </div>

      {/* Caption */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="h-2.5 sm:h-3 w-36 sm:w-44 bg-gray-300 rounded"></div>
      </div>

    </div>
  );
};

export default SkeletonPost;