"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { FriendRequest } from "@/models/FriendRequest";
import { revalidatePath } from "next/cache";

export async function createPost(content: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Post content cannot be empty");
  }

  await connectDB();
  const userId = (session.user as any).id;

  await Post.create({
    content: trimmed,
    author: userId,
  });

  revalidatePath("/feed");
}

export async function deletePost(postId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await connectDB();
  const userId = (session.user as any).id;

  const post = await Post.findById(postId);
  if (!post) {
    throw new Error("Post not found");
  }

  if (post.author.toString() !== userId) {
    throw new Error("Forbidden");
  }

  await Post.findByIdAndDelete(postId);
  revalidatePath("/feed");
  revalidatePath("/profile");
}

export async function getFeed() {
  const session = await auth();
  if (!session?.user) {
    return [];
  }

  await connectDB();
  const userId = (session.user as any).id;

  // Find accepted friends where user is sender or receiver
  const friendships = await FriendRequest.find({
    status: "accepted",
    $or: [{ sender: userId }, { receiver: userId }],
  });

  const friendIds = friendships.map((f) =>
    f.sender.toString() === userId ? f.receiver : f.sender
  );

  const authorIds = [userId, ...friendIds];

  const posts = await Post.find({ author: { $in: authorIds } })
    .populate("author", "username name avatar")
    .sort({ createdAt: -1 })
    .lean();

  return posts.map((post: any) => ({
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
}
