import { model, Model, Schema, Document } from 'mongoose';

export interface ILockdown extends Document {
    channelId: string;
    time: string;
    reason: string;
};

export const Lockdown: Schema = new Schema({
    channelId: String,
    time: String,
    reason: String,
});

export default model<ILockdown>("Lockdown", Lockdown);