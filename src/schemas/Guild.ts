import { model, Model, Schema, Document } from 'mongoose';

interface IGuild extends Document {
    id: string;
    name: string;
};

const guildSchema: Schema = new Schema({
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

const Guild: Model<IGuild> = model('Guild', guildSchema);

export default Guild;