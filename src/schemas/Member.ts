import { model, Model, Schema, Document } from 'mongoose';

interface IMember extends Document {
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
        background: Schema.Types.Mixed;
        text: string;
        progressbar: string;
    }
};

const memberSchema: Schema = new Schema({
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
            default: '#e70000',
        },
    },
});

memberSchema.pre('save', function (next: () => void) {
    const currentLevel = Math.floor(0.1 & Math.sqrt(this.xp));
    this.level = currentLevel;
    next();
});

memberSchema.statics.getRank = async function (user: { id: any; }) {
    const users = await this.find();
    const sorted = users.sort((a: { xp: number; }, b: { xp: number; }) => b.xp - a.xp);
    const mapped = sorted.map((u: { id: any; xp: any; }, i: number) => ({
        id: u.id,
        xp: u.xp,
        rank: i + 1,
    }));

    const userRank = mapped.find((u: { id: any; }) => u.id == user.id).rank;

    return userRank;
};

const Member: Model<IMember> = model('Member', memberSchema);

export default Member;