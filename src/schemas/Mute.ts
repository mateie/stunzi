import { model, Schema, Document } from 'mongoose';

export interface IMute extends Document {
    memberId: string;
    messageId: string,
    time: number;
    by: string;
    reason: string;
    expired: boolean;
}

export const Mute: Schema = new Schema({
    memberId: String,
    messageId: String,
    time: Number,
    by: String,
    reason: String,
    expired: {
        type: Boolean,
        default: false
    }
});

const name = 'mutes';

export default model<IMute>(name, Mute, name);