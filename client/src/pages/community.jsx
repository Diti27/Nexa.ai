import { useAuth, useUser } from "@clerk/clerk-react";
import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useUser();
  const { getToken } = useAuth();

  const fetchCreations = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/user/get-published-creations", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setCreations(data.creations);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (creation) => {
    const userId = user?.id;
    const alreadyLiked = creation.likes.includes(userId);

    // Optimistic update
    setCreations((prev) =>
      prev.map((c) =>
        c.id === creation.id
          ? {
              ...c,
              likes: alreadyLiked
                ? c.likes.filter((id) => id !== userId)
                : [...c.likes, userId],
            }
          : c
      )
    );

    try {
      const { data } = await axios.post(
        "/api/user/toggle-like-creation",
        { id: creation.id },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (!data.success) {
        toast.error(data.message);
        // Revert on failure
        setCreations((prev) =>
          prev.map((c) =>
            c.id === creation.id ? { ...c, likes: creation.likes } : c
          )
        );
      }
    } catch (error) {
      toast.error(error.message);
      // Revert on failure
      setCreations((prev) =>
        prev.map((c) =>
          c.id === creation.id ? { ...c, likes: creation.likes } : c
        )
      );
    }
  };

  useEffect(() => {
    if (user) {
      fetchCreations();
    }
  }, [user]);

  return (
    <div className="flex-1 h-full flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">Creations</h1>

      <div className="bg-white h-full w-full rounded-xl overflow-y-scroll">
        {loading ? (
          <div className="flex justify-center items-center h-full py-20">
            <span className="w-6 h-6 rounded-full border-2 border-t-transparent border-blue-500 animate-spin" />
          </div>
        ) : creations.length === 0 ? (
          <div className="flex justify-center items-center h-full py-20">
            <p className="text-sm text-gray-400">
              No published creations yet. Be the first to share!
            </p>
          </div>
        ) : (
          creations.map((creation, index) => (
            <div
              key={creation.id ?? index}
              className="relative group inline-block p-3 w-full sm:w-1/2 lg:w-1/3"
            >
              <img
                src={creation.content}
                alt=""
                className="w-full h-full object-cover rounded-lg"
              />

              <div
                className="absolute inset-0 m-3 flex items-end justify-end gap-2
              group-hover:justify-between p-3
              group-hover:bg-gradient-to-b from-transparent to-black/80
              text-white rounded-lg"
              >
                <p className="text-sm hidden group-hover:block">
                  {creation.prompt}
                </p>

                <div className="flex gap-1 items-center">
                  <p>{creation.likes.length}</p>

                  <Heart
                    onClick={() => handleLike(creation)}
                    className={`min-w-5 h-5 hover:scale-110 cursor-pointer ${
                      creation.likes.includes(user?.id)
                        ? "fill-red-500 text-red-600"
                        : "text-white"
                    }`}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Community;