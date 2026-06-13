import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFriendRequest extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

const FriendRequestSchema: Schema = new Schema<IFriendRequest>({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export const FriendRequest: Model<IFriendRequest> =
  mongoose.models.FriendRequest ||
  mongoose.model<IFriendRequest>("FriendRequest", FriendRequestSchema);
