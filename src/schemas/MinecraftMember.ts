import { model, Schema, Document } from 'mongoose';

export interface IMinecraftMember extends Document {
    memberId: string;
    discordUsername: string;
    minecraftUsername: string;
};

export const MinecraftMember: Schema = new Schema({
    memberId: String,
    discordUsername: String,
    minecraftUsername: String,
});

export default model<IMinecraftMember>('MinecraftMember', MinecraftMember);