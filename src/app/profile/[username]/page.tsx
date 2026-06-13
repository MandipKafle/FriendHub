import Image from "next/image";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Post } from "@/models/Post";
import { FriendRequest } from "@/models/FriendRequest";
import { PostCard } from "@/components/PostCard";
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest } from "@/actions/friends";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = await params;
  const username = resolvedParams.username;

  await connectDB();
  const dbUser = await User.findOne({ username }).lean();

  if (!dbUser) {
    notFound();
  }

  const session = await auth();
  const currentUserId = (session?.user as any)?.id;
  const isOwnProfile = currentUserId === dbUser._id.toString();

  // Get user posts
  const posts = await Post.find({ author: dbUser._id })
    .populate("author", "username name avatar")
    .sort({ createdAt: -1 })
    .lean();

  const formattedPosts = posts.map((post: any) => ({
    id: post._id.toString(),
    content: post.content,
    createdAt: post.createdAt.toISOString(),
    author: {
      id: post.author._id.toString(),
      username: post.author.username,
      name: post.author.name || post.author.username,
      avatar: post.author.avatar || "",
    },
  }));

  // Determine friendship status
  let friendshipStatus: "none" | "sent_pending" | "received_pending" | "friends" = "none";
  let requestId = "";

  if (currentUserId && !isOwnProfile) {
    const request = await FriendRequest.findOne({
      $or: [
        { sender: currentUserId, receiver: dbUser._id },
        { sender: dbUser._id, receiver: currentUserId },
      ],
    }).lean();

    if (request) {
      requestId = request._id.toString();
      if (request.status === "accepted") {
        friendshipStatus = "friends";
      } else if (request.status === "pending") {
        friendshipStatus =
          request.sender.toString() === currentUserId ? "sent_pending" : "received_pending";
      }
    }
  }

  const joinDate = new Date(dbUser.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Profile Info Details */}
      <div className="md:col-span-1">
        <div className="border border-gray-200 bg-white p-4 rounded text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-4 mb-4">
            {dbUser.avatar ? (
              <Image
                src={dbUser.avatar}
                alt={dbUser.username}
                width={80}
                height={80}
                className="rounded-full border border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200" />
            )}
            <div className="min-w-0 text-center md:text-left">
              <h1 className="text-base font-bold text-black truncate">{dbUser.name || dbUser.username}</h1>
              <p className="text-xs text-gray-500 font-mono">@{dbUser.username}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            {dbUser.bio && (
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Bio</h3>
                <p className="text-xs text-gray-700 leading-relaxed">{dbUser.bio}</p>
              </div>
            )}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Joined</h3>
              <p className="text-xs text-gray-700">{joinDate}</p>
            </div>
          </div>

          {currentUserId && !isOwnProfile && (
            <div className="border-t border-gray-100 pt-4 mt-4">
              {friendshipStatus === "none" && (
                <form action={sendFriendRequest.bind(null, dbUser._id.toString())}>
                  <button
                    type="submit"
                    className="w-full rounded border border-black bg-black py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
                  >
                    Add Friend
                  </button>
                </form>
              )}
              {friendshipStatus === "sent_pending" && (
                <button
                  disabled
                  className="w-full rounded border border-gray-200 bg-gray-50 py-1.5 text-xs font-semibold text-gray-400 cursor-not-allowed"
                >
                  Friend Request Sent
                </button>
              )}
              {friendshipStatus === "received_pending" && (
                <div className="flex gap-2">
                  <form action={acceptFriendRequest.bind(null, requestId)} className="flex-1">
                    <button
                      type="submit"
                      className="w-full rounded border border-black bg-black py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
                    >
                      Accept
                    </button>
                  </form>
                  <form action={rejectFriendRequest.bind(null, requestId)} className="flex-1">
                    <button
                      type="submit"
                      className="w-full rounded border border-gray-300 bg-white py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              )}
              {friendshipStatus === "friends" && (
                <span className="block text-center rounded border border-gray-200 bg-gray-50 py-1.5 text-xs font-semibold text-gray-500">
                  Friends
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User's Posts list */}
      <div className="md:col-span-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          {isOwnProfile ? "My Posts" : `${dbUser.name || dbUser.username}'s Posts`}
        </h2>
        {formattedPosts.length === 0 ? (
          <div className="border border-dashed border-gray-200 bg-white py-12 text-center rounded text-xs text-gray-400">
            No posts to show yet.
          </div>
        ) : (
          formattedPosts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
          ))
        )}
      </div>
    </div>
  );
}
