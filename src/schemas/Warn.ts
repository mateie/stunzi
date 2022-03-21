import { model, Model, Schema, Document } from 'mongoose';

export interface IWarn extends Document {
    memberId: string;
    time: number;
    by: string;
    reason: string;
};

export const Warn: Schema = new Schema({
    memberId: String,
    time: Number,
    by: String,
    reason: String,
});

export default model<IWarn>("Warn", Warn);