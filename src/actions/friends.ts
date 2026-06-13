"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { FriendRequest } from "@/models/FriendRequest";
import { revalidatePath } from "next/cache";

export async function searchUsers(query: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await connectDB();
  const userId = (session.user as any).id;

  const users = await User.find({
    _id: { $ne: userId },
    $or: [
      { username: { $regex: query, $options: "i" } },
      { name: { $regex: query, $options: "i" } },
    ],
  })
    .limit(20)
    .lean();

  // For each searched user, check friendship status
  const statuses = await Promise.all(
    users.map(async (u: any) => {
      const request = await FriendRequest.findOne({
        $or: [
          { sender: userId, receiver: u._id },
          { sender: u._id, receiver: userId },
        ],
      }).lean();

      let status = "none";
      let requestId = "";

      if (request) {
        requestId = request._id.toString();
        if (request.status === "accepted") {
          status = "friends";
        } else if (request.status === "pending") {
          status = request.sender.toString() === userId ? "sent_pending" : "received_pending";
        }
      }

      return {
        id: u._id.toString(),
        username: u.username,
        name: u.name || u.username,
        avatar: u.avatar || "",
        bio: u.bio || "",
        friendshipStatus: status,
        requestId,
      };
    })
  );

  return statuses;
}

export async function sendFriendRequest(receiverId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await connectDB();
  const senderId = (session.user as any).id;

  if (senderId === receiverId) {
    throw new Error("Cannot add yourself");
  }

  const existing = await FriendRequest.findOne({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId },
    ],
  });

  if (existing) {
    throw new Error("Request already exists");
  }

  await FriendRequest.create({
    sender: senderId,
    receiver: receiverId,
    status: "pending",
  });

  revalidatePath("/friends");
}

export async function acceptFriendRequest(requestId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await connectDB();
  const userId = (session.user as any).id;

  const request = await FriendRequest.findById(requestId);
  if (!request) {
    throw new Error("Request not found");
  }

  if (request.receiver.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  request.status = "accepted";
  await request.save();

  revalidatePath("/friends");
  revalidatePath("/feed");
}

export async function rejectFriendRequest(requestId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await connectDB();
  const userId = (session.user as any).id;

  const request = await FriendRequest.findById(requestId);
  if (!request) {
    throw new Error("Request not found");
  }

  if (request.receiver.toString() !== userId && request.sender.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  await FriendRequest.findByIdAndDelete(requestId);

  revalidatePath("/friends");
  revalidatePath("/feed");
}

export async function getFriendRequests() {
  const session = await auth();
  if (!session?.user) {
    return [];
  }

  await connectDB();
  const userId = (session.user as any).id;

  const requests = await FriendRequest.find({
    receiver: userId,
    status: "pending",
  })
    .populate("sender", "username name avatar")
    .lean();

  return requests.map((req: any) => ({
    id: req._id.toString(),
    sender: {
      id: req.sender._id.toString(),
      username: req.sender.username,
      name: req.sender.name || req.sender.username,
      avatar: req.sender.avatar || "",
    },
  }));
}

export async function getFriendsList() {
  const session = await auth();
  if (!session?.user) {
    return [];
  }

  await connectDB();
  const userId = (session.user as any).id;

  const friendships = await FriendRequest.find({
    status: "accepted",
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .populate("sender", "username name avatar bio")
    .populate("receiver", "username name avatar bio")
    .lean();

  return friendships.map((f: any) => {
    const friend = f.sender._id.toString() === userId ? f.receiver : f.sender;
    return {
      id: friend._id.toString(),
      username: friend.username,
      name: friend.name || friend.username,
      avatar: friend.avatar || "",
      bio: friend.bio || "",
    };
  });
}
