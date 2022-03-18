import { model, Model, Schema, Document } from 'mongoose';

interface ITicket extends Document {
    ticketId: string;
    memberId: string;
    channelId: string;
    closed: boolean;
    locked: boolean;
    type: string;
};

const ticketSchema: Schema = new Schema({
    ticketId: String,
    memberId: String,
    channelId: String,
    closed: Boolean,
    locked: Boolean,
    type: String,
});

const Ticket: Model<ITicket> = model('Ticket', ticketSchema);

export default Ticket;