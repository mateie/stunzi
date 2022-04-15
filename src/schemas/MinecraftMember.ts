import { model, Schema, Document } from 'mongoose';

export interface IMinecraftMember extends Document {
    memberId: string;
    discordUsername: string;
    minecraftUsername: string;
}

export const MinecraftMember: Schema = new Schema({
    memberId: String,
    discordUsername: String,
    minecraftUsername: String,
});

const name = 'minecraft-members';

export default model<IMinecraftMember>(name, MinecraftMember, name);