"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    userid: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
});
const PlayerSchema = new mongoose_1.default.Schema({
    name: String,
    userid: { type: String, required: true },
    gender: String
});
const RoomSchema = new mongoose_1.default.Schema({
    title: String,
});
exports.User = mongoose_1.default.model("User", UserSchema);
exports.Room = mongoose_1.default.model("Room", RoomSchema);
