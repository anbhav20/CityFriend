import { createContext, useCallback, useState } from "react";
import { handleFeed, handleUpload, handleUsersAllPosts } from "./services/post.api";

export const PostContext = createContext(null);

export const PostProvider = ({ children }) => { // ✅ typo: PostPovider → PostProvider
  const [loading,   setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);

  // ✅ single loading wrapper — eliminates repeated try/finally boilerplate
  const withLoading = useCallback(async (fn, opts = {}) => {
    if (opts.upload) setUploading(true);
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
      if (opts.upload) setUploading(false);
    }
  }, []);

  const feed          = ()         => withLoading(handleFeed);
  const usersAllPosts = ()         => withLoading(handleUsersAllPosts);
  const upload        = (formData) => withLoading(() => handleUpload(formData), { upload: true });

  return (
    <PostContext.Provider value={{
      loading,
      uploading,
      feed,
      upload,
      usersAllPosts,
    }}>
      {children}
    </PostContext.Provider>
  );
};