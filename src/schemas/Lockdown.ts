import { model, Model, Schema, Document } from 'mongoose';

interface ILockdown extends Document {
    channelId: string;
    time: string;
    reason: string;
};

const lockdownSchema: Schema = new Schema({
    channelId: String,
    time: String,
    reason: String,
});

const Lockdown: Model<ILockdown> = model('Lockdown', lockdownSchema);

export default Lockdown;