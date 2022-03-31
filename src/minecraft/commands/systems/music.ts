import { CommandEvent } from "@scriptserver/command";
import Client from "../../../classes/Client";
import IMineCommand from "../../../classes/interfaces/IMineCommand";
import MineCommand from "../../../classes/games/minecraft/MineCommand";
import channels from "../../../data/channels";

import MinecraftMember from "../../../schemas/MinecraftMember";
import { GuildMember, TextChannel, VoiceChannel } from "discord.js";

export default class MusicMineCommand extends MineCommand implements IMineCommand {
    constructor(client: Client) {
        super(client);

        this.name = 'music';
        this.usage = {
            play: '<query>',
            skip: null,
            skipto: '<to>'
        };
        this.subcommands = ['play', 'skip', 'skipto'];
    }

    async run(command: CommandEvent, _: string[]) {
        const subcommand = _[0];
        const args = _.slice(1, _.length);

        if (subcommand.length < 1 || !subcommand) return this.missingSub(command, <string>this.subcommands?.join(' | '))

        const { player } = command;

        const db = await MinecraftMember.findOne({ minecraftUsername: player });
        if (!db) return this.notLinked(player);

        const guild = this.client.mainGuild;
        const member = <GuildMember>guild.members.cache.get(db.memberId);
        const channel = <TextChannel>guild.channels.cache.get(channels.text.music);
        const voiceChannel = <VoiceChannel>member.voice.channel;

        if (!voiceChannel) return this.server.util.tellRaw('You must be in a voice channel to be able to use the music commands', player);
        if (guild.me?.voice.channelId && voiceChannel.id !== guild.me.voice.channelId)
            return this.server.util.tellRaw(`I'm already playing music in ${guild.me.voice.channel?.name}`, player);

        if (member.voice.deaf) return this.server.util.tellRaw('You cannot play music when deafened', player);

        let queue = this.client.music.getQueue(guild);

        switch (subcommand) {
            case 'play': {
                if (args.length < 1) return this.missingSubArgs(command, subcommand, this.usage[subcommand]);

                if (!queue) {
                    queue = this.client.music.createQueue(guild, {
                        metadata: channel
                    });

                    try {
                        if (!queue.connection) await queue.connect(voiceChannel);
                    } catch {
                        queue.destroy();
                        return this.server.util.tellRaw('Could not join your voice channel', player);
                    }
                }

                const query = args.join('');
                const result = await this.client.music.search(query, {
                    requestedBy: member.user,
                });

                if (result.tracks.length < 1 || !result.tracks[0])
                    return this.server.util.tellRaw(`Track ${query} was not found`);

                if (result.playlist) queue.addTracks(result.playlist.tracks);
                else queue.addTrack(result.tracks[0]);

                if (!queue.playing) queue.play();

                this.server.util.tellRaw('Track/Playlist Received', player);
                break;
            }
            case 'skip': {
                if (!queue) return this.server.util.tellRaw('Music is not playing', player);
                if (queue.tracks.length < 1)
                    return this.server.util.tellRaw('There are no upcoming tracks to skip to', player);

                queue.skip();
                return this.server.util.tellRaw('Current track skipped', player)
            }
            case 'skipto': {
                if (args.length < 1) return this.missingSubArgs(command, subcommand, this.usage[subcommand]);

                if (!queue) return this.server.util.tellRaw('Music is not playing', player);
                if (queue.tracks.length < 1)
                    return this.server.util.tellRaw('There are no upcoming tracks to skip to', player);

                const position = parseInt(args[0]);
                const skipto = position - 1;
                const track = queue.tracks[skipto];
                queue.skipTo(skipto);
                return this.server.util.tellRaw(`Skipped to ${track.author} - ${track.title}`, player);
            }
        }
    }
}