import { model, Schema, Document } from 'mongoose';

export interface ITicket extends Document {
    ticketId: string;
    memberId: string;
    channelId: string;
    closed: boolean;
    locked: boolean;
    type: string;
}

export const Ticket: Schema = new Schema({
    ticketId: String,
    memberId: String,
    channelId: String,
    closed: Boolean,
    locked: Boolean,
    type: String,
});

const name = 'tickets';

export default model<ITicket>(name, Ticket, name);