import Image from "next/image";
import Link from "next/link";
import { deletePost } from "@/actions/posts";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      username: string;
      name: string;
      avatar: string;
    };
  };
  currentUserId?: string;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const isAuthor = currentUserId === post.author.id;
  const formattedDate = new Date(post.createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="border border-gray-200 bg-white p-4 rounded mb-3">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {post.author.avatar ? (
            <Image
              src={post.author.avatar}
              alt={post.author.username}
              width={24}
              height={24}
              className="rounded-full border border-gray-200"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200" />
          )}
          <div>
            <Link
              href={`/profile/${post.author.username}`}
              className="text-xs font-bold text-black hover:underline"
            >
              {post.author.name}
            </Link>
            <span className="text-xs text-gray-500 ml-1">@{post.author.username}</span>
            <span className="text-xs text-gray-400 mx-1.5">•</span>
            <span className="text-[10px] text-gray-400">{formattedDate}</span>
          </div>
        </div>

        {isAuthor && (
          <form action={deletePost.bind(null, post.id)}>
            <button
              type="submit"
              className="text-[10px] text-red-500 font-semibold hover:underline"
            >
              Delete
            </button>
          </form>
        )}
      </div>
      <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">{post.content}</p>
    </div>
  );
}
