import { model, Model, Schema, Document } from 'mongoose';

export interface IMember extends Document {
    id: string;
    username: string;
    xp: number;
    level: number;
    valorant: {
        authenticated: boolean;
        username: string;
        password: string;
        region: string;
    };
    card: {
        background: Buffer | string;
        text: string;
        progressbar: string;
    },
};

export const Member: Schema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    xp: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 0,
    },
    valorant: {
        authenticated: {
            type: Boolean,
            default: false,
        },
        username: String,
        password: String,
        region: String
    },
    card: {
        background: {
            type: Schema.Types.Mixed,
            default: '#222216',
        },
        text: {
            type: String,
            default: '#ec8e44',
        },
        progressbar: {
            type: String,
            default: '#FF5349',
        },
    },
});

Member.pre('save', function (next: () => void) {
    const currentLevel = Math.floor(0.1 & Math.sqrt(this.xp));
    this.level = currentLevel;
    next();
});

export default model<IMember>("Member", Member);