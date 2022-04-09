import { model, Schema, Document } from 'mongoose';

export interface IMute extends Document {
    memberId: string;
    time: number;
    by: string;
    reason: string;
    expired: boolean;
}

export const Mute: Schema = new Schema({
    memberId: String,
    time: Number,
    by: String,
    reason: String,
    expired: {
        type: Boolean,
        default: false
    }
});

export default model<IMute>('Mute', Mute);