import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { FiSearch, FiUsers, FiMapPin } from "react-icons/fi";
import MainLayout from "../../../components/MainLayout";
import UserSkeleton from "../../../components/UserSkeleton";
import UserCard from "../../../components/UserCard";
import { useUser } from "../hooks/useUser";

const FILTERS = [
  { key: "all",  label: "All Users", icon: FiUsers  },
  { key: "city", label: "Same City", icon: FiMapPin },
];

const Explore = () => {
  const [users,        setUsers]        = useState([]);
  const [search,       setSearch]       = useState("");
  const [filter,       setFilter]       = useState("all");
  const [isFetching,   setIsFetching]   = useState(false); // ✅ local fetch state — independent of context loading

  const { allUsers, usersSameCity } = useUser();

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      setIsFetching(true);  // ✅ start loading BEFORE clearing users
                            //    so skeleton shows instead of empty state
      try {
        const res = filter === "all" ? await allUsers() : await usersSameCity();
        if (!cancelled) setUsers(res?.users ?? []);
      } catch {
        if (!cancelled) toast.error("Failed to load users.");
      } finally {
        if (!cancelled) setIsFetching(false); // ✅ only stop loading after data is set
      }
    };

    fetchUsers();
    return () => { cancelled = true; };
  }, [filter]); // ✅ removed allUsers/usersSameCity from deps — they're stable context fns
                //    having them caused re-fetches on every render

  const filteredUsers = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <MainLayout>
      <main className="min-h-screen bg-gray-50 px-4 py-5">
        <div className="max-w-xl mx-auto space-y-4">

          <div>
            <h1 className="text-xl font-bold text-gray-900">Find Friends</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Discover and connect with people around you
            </p>
          </div>

          <div className="relative">
            <FiSearch
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              placeholder="Search users…"
              className="
                w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
                bg-white border border-gray-200
                placeholder-gray-400 text-gray-800
                focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                transition
              "
            />
          </div>

          <div className="flex gap-2">
            {FILTERS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition
                  ${filter === key
                    ? "bg-blue-500 text-white shadow-sm shadow-blue-100"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-500"
                  }
                `}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {!isFetching && search && (
            <p className="text-xs text-gray-400 -mb-2">
              {filteredUsers.length === 0
                ? "No results"
                : `${filteredUsers.length} result${filteredUsers.length !== 1 ? "s" : ""} for "${search}"`}
            </p>
          )}

          <div className="space-y-3">
            {isFetching ? ( // ✅ use local isFetching — not context loading
              Array.from({ length: 4 }, (_, i) => <UserSkeleton key={i} />)
            ) : filteredUsers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-sm font-medium text-gray-700">No users found</p>
                <p className="text-xs text-gray-400 mt-1">
                  {search ? `No results for "${search}"` : "No users in this category yet."}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <UserCard key={user._id} user={user} />
              ))
            )}
          </div>

        </div>
      </main>
    </MainLayout>
  );
};

export default Explore;