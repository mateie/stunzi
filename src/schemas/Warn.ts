import { model, Schema, Document } from 'mongoose';

export interface IWarn extends Document {
    memberId: string;
    time: number;
    by: string;
    reason: string;
}

export const Warn: Schema = new Schema({
    memberId: String,
    time: Number,
    by: String,
    reason: String,
});

const name = 'warns';

export default model<IWarn>(name, Warn, name);