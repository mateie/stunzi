import { model, Schema, Document } from 'mongoose';

export interface IStation extends Document {
    memberId: string;
    channelId: string;
    sharedWith: [string],
};

export const Station: Schema = new Schema({
    memberId: {
        type: String,
        required: true,
    },
    channelId: {
        type: String,
        required: true
    },
    sharedWith: [],
});

export default model<IStation>('Station', Station);