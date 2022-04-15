import { model, Schema, Document } from 'mongoose';

export interface ISuggestion extends Document {
    messageId: string;
    details: Array<Record<string, unknown>>
}

export const Suggestion: Schema = new Schema({
    messageId: String,
    details: Array,
});

const name = 'suggestions';

export default model<ISuggestion>(name, Suggestion, name);