import { model, Schema, Document } from 'mongoose';

export interface ILockdown extends Document {
    channelId: string;
    time: number;
    reason: string;
}

export const Lockdown: Schema = new Schema({
    channelId: String,
    time: Number,
    reason: String,
});

export default model<ILockdown>('Lockdown', Lockdown);