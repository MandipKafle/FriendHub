import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPost extends Document {
  content: string;
  createdAt: Date;
  author: mongoose.Types.ObjectId;
}

const PostSchema: Schema = new Schema<IPost>({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
