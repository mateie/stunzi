import { model, Schema, Document } from 'mongoose';

export interface IGuild extends Document {
    id: string;
    name: string;
    words: string[]; 
}

export const Guild: Schema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    words: [],
});

const name = 'guilds';

export default model<IGuild>(name, Guild, name);