import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userid: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
});

const PlayerSchema = new mongoose.Schema({
  name: String,
  userid: {type:String, required : true},
  gender: String
});

const RoomSchema = new mongoose.Schema({
  title: String,
});

export const User = mongoose.model("User", UserSchema);
export const Room = mongoose.model("Room", RoomSchema);
