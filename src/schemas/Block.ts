import { model, Model, Schema, Document } from 'mongoose';

interface IBlock extends Document {
    memberId: string;
    time: string;
    by: string;
    reason: string;
    expired: boolean;
};

const blockSchema: Schema = new Schema({
    memberId: String,
    time: String,
    by: String,
    reason: String,
    expired: {
        type: Boolean,
        default: false
    }
});

const Block: Model<IBlock> = model('Block', blockSchema);

export default Block;