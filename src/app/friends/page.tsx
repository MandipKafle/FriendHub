import { getFriendRequests, getFriendsList, searchUsers } from "@/actions/friends";
import { UserCard } from "@/components/UserCard";

interface FriendsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function FriendsPage({ searchParams }: FriendsPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

  const requests = await getFriendRequests();
  const friends = await getFriendsList();
  
  // Only search if query is non-empty
  const searchResults = query ? await searchUsers(query) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Search Users and Requests */}
      <div className="md:col-span-2 space-y-6">
        {/* Search Users Section */}
        <div className="border border-gray-200 bg-white p-4 rounded">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Search Users</h2>
          <form method="GET" action="/friends" className="flex gap-2 mb-4">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by username or name..."
              className="flex-1 rounded border border-gray-200 px-3 py-1.5 text-xs focus:border-black focus:outline-none"
            />
            <button
              type="submit"
              className="rounded border border-black bg-black px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
            >
              Search
            </button>
          </form>

          {query && (
            <div>
              <h3 className="text-[11px] font-bold text-gray-400 mb-2">Search Results</h3>
              {searchResults.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-2">No users found matching &quot;{query}&quot;.</p>
              ) : (
                searchResults.map((user) => (
                  <UserCard key={user.id} user={user as any} />
                ))
              )}
            </div>
          )}
        </div>

        {/* Incoming Requests Section */}
        <div className="border border-gray-200 bg-white p-4 rounded">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Incoming Requests</h2>
          {requests.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2">No pending friend requests.</p>
          ) : (
            requests.map((req) => (
              <UserCard
                key={req.id}
                user={{
                  id: req.sender.id,
                  username: req.sender.username,
                  name: req.sender.name,
                  avatar: req.sender.avatar,
                  friendshipStatus: "received_pending",
                  requestId: req.id,
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Friends List Section */}
      <div>
        <div className="border border-gray-200 bg-white p-4 rounded">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Friends List</h2>
          {friends.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2">You haven&apos;t added any friends yet.</p>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <UserCard
                  key={friend.id}
                  user={{
                    id: friend.id,
                    username: friend.username,
                    name: friend.name,
                    avatar: friend.avatar,
                    bio: friend.bio,
                    friendshipStatus: "friends",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
