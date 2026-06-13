import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  githubId: string;
  username: string;
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema<IUser>({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String },
  avatar: { type: String },
  bio: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
