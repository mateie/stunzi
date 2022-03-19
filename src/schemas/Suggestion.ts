import { model, Model, Schema, Document } from 'mongoose';

export interface ISuggestion extends Document {
    messageId: string;
    details: Array<Object>
};

export const Suggestion: Schema = new Schema({
    messageId: String,
    details: Array,
});

export default model<ISuggestion>("Suggestion", Suggestion);