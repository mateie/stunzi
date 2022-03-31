import { model, Schema, Document } from 'mongoose';

export interface IValorant extends Document {
    memberId: string;
    username: string;
    password: string;
    region: string;
};

export const Valorant: Schema = new Schema({
    memberId: {
        type: String,
        required: true,
        unique: true
    },
    username: String,
    password: String,
    region: String
});

export default model<IValorant>('Valorant', Valorant);