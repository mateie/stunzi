import { model, Model, Schema, Document } from 'mongoose';

interface IMute extends Document {
    memberId: string;
    time: string;
    by: string;
    reason: string;
    expired: boolean;
};

const muteSchema: Schema = new Schema({
    memberId: String,
    time: String,
    by: String,
    reason: String,
    expired: {
        type: Boolean,
        default: false
    }
});

const Mute: Model<IMute> = model('Mute', muteSchema);

export default Mute;