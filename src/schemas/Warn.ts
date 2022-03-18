import { model, Model, Schema, Document } from 'mongoose';

interface IWarn extends Document {
    memberId: string;
    time: string;
    by: string;
    reason: string;
};

const warnSchema: Schema = new Schema({
    memberId: String,
    time: String,
    by: String,
    reason: String,
});

const Warn: Model<IWarn> = model('Warn', warnSchema);

export default Warn;