import Image from "next/image";
import Link from "next/link";
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest } from "@/actions/friends";

interface UserCardProps {
  user: {
    id: string;
    username: string;
    name: string;
    avatar: string;
    bio?: string;
    friendshipStatus: "none" | "sent_pending" | "received_pending" | "friends";
    requestId?: string;
  };
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="flex items-center justify-between border border-gray-200 bg-white p-3 rounded mb-2 gap-3">
      <div className="flex items-center gap-2">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.username}
            width={32}
            height={32}
            className="rounded-full border border-gray-200"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200" />
        )}
        <div className="min-w-0">
          <Link
            href={`/profile/${user.username}`}
            className="text-xs font-bold text-black hover:underline block truncate"
          >
            {user.name}
          </Link>
          <span className="text-[10px] text-gray-500 block truncate">@{user.username}</span>
          {user.bio && <p className="text-[11px] text-gray-600 line-clamp-1 mt-0.5">{user.bio}</p>}
        </div>
      </div>

      <div className="flex-shrink-0">
        {user.friendshipStatus === "none" && (
          <form action={sendFriendRequest.bind(null, user.id)}>
            <button
              type="submit"
              className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              Add Friend
            </button>
          </form>
        )}
        {user.friendshipStatus === "sent_pending" && (
          <span className="text-[10px] text-gray-400 font-medium italic">Pending</span>
        )}
        {user.friendshipStatus === "received_pending" && user.requestId && (
          <div className="flex gap-1.5">
            <form action={acceptFriendRequest.bind(null, user.requestId)}>
              <button
                type="submit"
                className="rounded border border-black bg-black px-2 py-1 text-[11px] font-semibold text-white hover:bg-zinc-800"
              >
                Accept
              </button>
            </form>
            <form action={rejectFriendRequest.bind(null, user.requestId)}>
              <button
                type="submit"
                className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
              >
                Reject
              </button>
            </form>
          </div>
        )}
        {user.friendshipStatus === "friends" && (
          <span className="text-[10px] text-gray-500 font-semibold">Friends</span>
        )}
      </div>
    </div>
  );
}
