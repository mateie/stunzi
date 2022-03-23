import { model, Schema, Document } from 'mongoose';

export interface IValorant extends Document {
    memberId: string;
    authenticated: boolean;
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
    authenticated: {
        type: Boolean,
        default: false,
    },
    username: String,
    password: String,
    region: String
});

export default model<IValorant>('ValorantUser', Valorant);