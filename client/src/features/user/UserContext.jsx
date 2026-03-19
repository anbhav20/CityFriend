import { createContext, useCallback, useContext, useState } from "react";
import {
  getAllUsers,
  getUserSameCity,
  getUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowings,
  editUserProfile,
} from "./services/user.api";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  // ✅ Single loading wrapper — eliminates 8× repeated try/finally blocks
  const withLoading = useCallback(async (fn) => {
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  const allUsers      = ()           => withLoading(getAllUsers);
  const usersSameCity = ()           => withLoading(getUserSameCity);
  const userProfile   = (username)   => withLoading(() => getUserProfile(username));
  const follow        = (id)         => withLoading(() => followUser(id));
  const unFollow      = (id)         => withLoading(() => unfollowUser(id));
  const followers     = (id)         => withLoading(() => getFollowers(id));
  const followings    = (id)         => withLoading(() => getFollowings(id));

  // ✅ editProfile lives here because it may need to sync auth user — pass setter from AuthContext if needed
  const editProfile = (formData) => withLoading(() => editUserProfile(formData));

  return (
    <UserContext.Provider
      value={{
        loading,
        allUsers,
        usersSameCity,
        userProfile,
        follow,
        unFollow,
        followers,
        followings,
        editProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};