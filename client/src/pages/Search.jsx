import MainLayout from "../components/MainLayout";
import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import UserSkeleton from "../components/UserSkeleton";
import UserCard from "../components/UserCard";

const Search = () => {

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const getUsers = async () => {

    try {

      setLoading(true);

      let url = "https://cityfriend.onrender.com/api/users";

      if (filter === "city") {
        url = "https://cityfriend.onrender.com/city";
      }

      const res = await axios.get(url, {
        withCredentials: true
      });

      setUsers(res.data.users || []);

    } catch (error) {

      toast.error(
        error.response?.data?.message || "Failed to load users"
      );

    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    getUsers();
  }, [filter]);

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <MainLayout>

      <main className="ml-64 px-10 py-10 bg-gray-50 min-h-screen">

        {/* Header */}

        <div className="mb-6">

          <h1 className="text-2xl font-semibold text-gray-900">
            Find Friends
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Discover and connect with people around you
          </p>

        </div>


        {/* Search */}

        <div className="mb-4">

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xl py-2 px-4 outline outline-gray-300 rounded-lg"
            type="text"
            placeholder="Search users..."
          />

        </div>


        {/* Filters */}

        <div className="flex gap-3 mb-6">

          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-full text-sm border transition
              ${filter === "all"
                ? "bg-blue-500 text-white border-blue-500"
                : "border-gray-300 text-gray-600"}
            `}
          >
            All Users
          </button>

          <button
            onClick={() => setFilter("city")}
            className={`px-4 py-1.5 rounded-full text-sm border transition
              ${filter === "city"
                ? "bg-blue-500 text-white border-blue-500"
                : "border-gray-300 text-gray-600"}
            `}
          >
            Same City
          </button>

        </div>


        {/* Users */}

        <div className="max-w-2xl space-y-4">

          {loading ? (

            <>
              <UserSkeleton />
              <UserSkeleton />
              <UserSkeleton />
              <UserSkeleton />
            </>

          ) : filteredUsers.length === 0 ? (

            <p className="text-sm text-gray-500">
              User not found.
            </p>

          ) : (

            filteredUsers.map((user) => (
            <UserCard key={user._id} user={user} />
          ))

          )}

        </div>

      </main>

    </MainLayout>

  );
};

export default Search;