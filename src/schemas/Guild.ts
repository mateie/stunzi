import { model, Model, Schema, Document } from 'mongoose';

export interface IGuild extends Document {
    id: string;
    name: string;
};

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
});

export default model<IGuild>("Guild", Guild);