import { useContext } from "react";
import { PostContext } from "../PostContext";

export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) throw new Error("usePost must be used inside <PostProvider>");
  return context;
};