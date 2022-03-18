import { model, Model, Schema, Document } from 'mongoose';

interface IGiveaway extends Document {
    messageId: string,
    channelId: string,
    guildId: string,
    startAt: number,
    endAt: number,
    ended: boolean,
    winnerCount: number,
    prize: string,
    messages: {
        giveaway: string,
        giveawayEnded: string,
        inviteToParticipate: string,
        drawing: string,
        dropMessage: string,
        winMessage: Schema.Types.Mixed,
        embedFooter: Schema.Types.Mixed,
        noWinner: string,
        winners: string,
        endedAt: string,
        hostedBy: string
    },
    thumbnail: string,
    hostedBy: string,
    winnerIds: { type: Array<String> },
    reaction: Schema.Types.Mixed,
    botsCanWin: boolean,
    embedColor: Schema.Types.Mixed,
    embedColorEnd: Schema.Types.Mixed,
    exemptPermissions: { type: Array<any> },
    exemptMembers: string,
    bonusEntries: string,
    extraData: Schema.Types.Mixed,
    lastChance: {
        enabled: boolean,
        content: string,
        threshold: number,
        embedColor: Schema.Types.Mixed
    },
    pauseOptions: {
        isPaused: boolean,
        content: string,
        unPauseAfter: number,
        embedColor: Schema.Types.Mixed,
        durationAfterPause: number,
        infiniteDurationText: string
    },
    isDrop: boolean,
    allowedMentions: {
        parse: { type: Array<String> },
        users: { type: Array<String> },
        roles: { type: Array<String> }
    }
};

const giveawaySchema: Schema = new Schema({
    messageId: String,
    channelId: String,
    guildId: String,
    startAt: Number,
    endAt: Number,
    ended: Boolean,
    winnerCount: Number,
    prize: String,
    messages: {
        giveaway: String,
        giveawayEnded: String,
        inviteToParticipate: String,
        drawing: String,
        dropMessage: String,
        winMessage: Schema.Types.Mixed,
        embedFooter: Schema.Types.Mixed,
        noWinner: String,
        winners: String,
        endedAt: String,
        hostedBy: String
    },
    thumbnail: String,
    hostedBy: String,
    winnerIds: { type: [String], default: undefined },
    reaction: Schema.Types.Mixed,
    botsCanWin: Boolean,
    embedColor: Schema.Types.Mixed,
    embedColorEnd: Schema.Types.Mixed,
    exemptPermissions: { type: [], default: undefined },
    exemptMembers: String,
    bonusEntries: String,
    extraData: Schema.Types.Mixed,
    lastChance: {
        enabled: Boolean,
        content: String,
        threshold: Number,
        embedColor: Schema.Types.Mixed
    },
    pauseOptions: {
        isPaused: Boolean,
        content: String,
        unPauseAfter: Number,
        embedColor: Schema.Types.Mixed,
        durationAfterPause: Number,
        infiniteDurationText: String
    },
    isDrop: Boolean,
    allowedMentions: {
        parse: { type: [String], default: undefined },
        users: { type: [String], default: undefined },
        roles: { type: [String], default: undefined }
    }
}, { id: false });

const Giveaway: Model<IGiveaway> = model('Giveaway', giveawaySchema);

export default Giveaway;
