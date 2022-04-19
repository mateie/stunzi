import { model, Schema, Document } from 'mongoose';

export interface IBlock extends Document {
    memberId: string;
    messageId: string;
    time: number;
    by: string;
    reason: string;
    expired: boolean;
}

export const Block: Schema = new Schema({
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

const name = 'blocks';

export default model<IBlock>(name, Block, name);