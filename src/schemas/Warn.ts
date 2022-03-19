import { model, Model, Schema, Document } from 'mongoose';

interface IWarn extends Document {
    memberId: string;
    time: string;
    by: string;
    reason: string;
};

const Warn: Schema = new Schema({
    memberId: String,
    time: String,
    by: String,
    reason: String,
});

export default model<IWarn>("Warn", Warn);