import { model, Model, Schema, Document } from 'mongoose';

interface ISuggestion extends Document {
    messageId: string;
    details: Array<Object>
};

const suggestionSchema: Schema = new Schema({
    messageId: String,
    details: Array,
});

const Suggestion: Model<ISuggestion> = model('Suggestion', suggestionSchema);

export default Suggestion;