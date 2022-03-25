import { ButtonInteraction, Guild, GuildMember, Message, MessageButton, MessageEmbed, VoiceChannel } from "discord.js";
import Client from "../../../classes/Client";
import Event from "../../../classes/Event";
import IEvent from "../../../classes/interfaces/IEvent";

export default class MusicButtonsEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'interactionCreate';
    }

    async run(interaction: ButtonInteraction): Promise<any> {
        if (!interaction.isButton()) return;

        const { customId } = interaction;
        const guild = <Guild>interaction.guild;
        const member = <GuildMember>interaction.member;
        const message = <Message>interaction.message;
        const voiceChannel = <VoiceChannel>member.voice.channel;

        if (![
            'show_queue', 'show_track_progress', 'show_track_lyrics',
            'pause_track', 'resume_track',
            'skip_current_track', 'skip_to_track', 'cancel_track_select',
            'add_tracks',
            'enable_filters', 'disable_filters',
            'cancel_filter_enabling', 'cancel_filter_disabling'
        ].includes(customId)) return;

        const queue = this.client.music.getQueue(guild);
        if (!queue) return await interaction.reply({ content: 'Music is not playing', ephemeral: true });

        if (!voiceChannel) return interaction.reply({ content: 'You must be in a voice channel to be able to use the music buttons', ephemeral: true });

        if (queue.connection.channel.id !== voiceChannel.id) return interaction.reply({ content: `I'm already playing music in ${guild.me?.voice.channel}`, ephemeral: true });

        switch (customId) {
            case 'show_queue': {
                const mapped = queue.tracks.map((track, index) => {
                    return `\`${index + 1}\`. ${track.author} - ${track.title} | ${track.duration}`;
                });

                const chunked = this.client.util.chunk(mapped, 10);

                if (chunked.length < 1) return await interaction.reply({ content: 'There are no upcoming tracks', ephemeral: true });

                this.client.util.pagination(interaction, chunked, 'Upcoming Tracks');
                break;
            }
            case 'show_track_progress': {
                const rows = message.components;
                const button = <MessageButton>message.components[0].components[1];
                const embed = <MessageEmbed>message.embeds[0];
                const showButton = button.setDisabled(true);

                if (!embed.fields[2]) embed.addField('\u200b', queue.createProgressBar());
                else embed.fields[2] = { name: '\u200b', value: queue.createProgressBar(), inline: false };

                message.edit({ embeds: [embed], components: rows });

                setTimeout(() => {
                    showButton.setDisabled(false);
                    message.edit({ components: rows });
                }, 3000);
                return interaction.reply({ content: 'Progress bar displayed', ephemeral: true });
            }
            case 'show_track_lyrics': {
                const rows = message.components;
                const button = <MessageButton>message.components[0].components[2];
                const showButton = button.setDisabled(true);

                const currentTrack = queue.nowPlaying();

                const title = currentTrack.title.split('(')[0];

                const search = await this.client.music.searchLyrics(title);

                if (!search) return interaction.reply({ content: 'Lyrics not found', ephemeral: true });

                const chunkedLyrics = this.client.util.chunk(search.lyrics, 1024);

                console.log(chunkedLyrics);

                await this.client.util.pagination(interaction, chunkedLyrics, `${title} Lyrics`, false, 60000);
                break;
            }
            case 'pause_track': {
                const currentTrack = queue.nowPlaying();
                const requestedBy = <GuildMember>guild.members.cache.get(currentTrack.requestedBy.id);
                if (currentTrack.requestedBy.id !== member.id) return interaction.reply({ content: `You didn't request this track, ask ${requestedBy} to pause the track, because they requested it`, ephemeral: true });
                queue.setPaused(true)
                const rows = message.components;
                const button = <MessageButton>message.components[1].components[0];
                const playButton = button
                    .setCustomId('resume_track')
                    .setLabel('Resume Track')
                    .setStyle('SUCCESS');

                message.components[1].components[0] = playButton;

                message.edit({ components: rows })
                return interaction.reply({ content: 'Track has been paused', ephemeral: true });
            }
            case 'resume_track': {
                const currentTrack = queue.nowPlaying();
                const requestedBy = <GuildMember>guild.members.cache.get(currentTrack.requestedBy.id);
                if (currentTrack.requestedBy.id !== member.id) return interaction.reply({ content: `You didn't request this track, ask ${requestedBy} to resume the track, because they requested it`, ephemeral: true });
                queue.setPaused(false);
                const rows = message.components;
                const button = <MessageButton>message.components[1].components[0];
                const pauseButton = button
                    .setCustomId('pause_track')
                    .setLabel('Pause Track')
                    .setStyle('DANGER');

                message.components[1].components[0] = pauseButton;

                message.edit({ components: rows })
                return interaction.reply({ content: 'Track has been resumed', ephemeral: true });
            }
            case 'skip_current_track': {
                const currentTrack = queue.nowPlaying();
                const requestedBy = <GuildMember>guild.members.cache.get(currentTrack.requestedBy.id);
                if (currentTrack.requestedBy.id !== member.id) return interaction.reply({ content: `You didn't request this track, ask ${requestedBy} to skip the track, because they requested it`, ephemeral: true });
                queue.skip();

                const embed = message.embeds[0].setDescription('**Skipped Track**');

                message.edit({ embeds: [embed], components: [] });
                setTimeout(() => {
                    message.delete();
                }, 10000);
                return interaction.reply({ content: 'Track has been skipped', ephemeral: true });
            }
            case 'skip_to_track': {
                const rows = message.components;
                if (rows[3] && rows[3].components[0].customId === 'select_filter_enable') return interaction.reply({ content: 'You are selecting filter to enable, choose or cancel to select a track', ephemeral: true });
                if (rows[3] && rows[3].components[0].customId === 'select_filter_disable') return interaction.reply({ content: 'You are selecting filter to disable, choose or cancel to select a track', ephemeral: true });
                if (queue.tracks.length < 1) return interaction.reply({ content: 'There are no upcoming tracks', ephemeral: true });
                const tracks = queue.tracks;
                const mapped = tracks.filter((_, i) => i < 25).map(track => {
                    return {
                        label: `${track.author} - ${track.title.includes('(') ? track.title.split(' (')[0] : track.title}`,
                        value: `${queue.getTrackPosition(track)}`,
                    }
                });

                const button = <MessageButton>message.components[1].components[2];
                const cancelButton = button
                    .setCustomId('cancel_track_select')
                    .setLabel('Cancel Track Selection')
                    .setStyle('SECONDARY');

                const selectMenu = this.client.util.selectMenu()
                    .setCustomId('select_track')
                    .setPlaceholder('Select a track')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .setOptions(mapped);

                message.components[1].components[2] = cancelButton;

                rows.push(
                    this.client.util.actionRow()
                        .addComponents(selectMenu)
                );

                message.edit({ components: rows });
                return interaction.reply({ content: 'Select from above', ephemeral: true });
            }
            case 'cancel_track_select': {
                if (!message.components[3] || message.components[3].components[0].customId !== 'select_track') return interaction.reply({ content: 'There is no track selection', ephemeral: true });
                const rows = [message.components[0], message.components[1], message.components[2]];

                interaction.reply({ content: 'Cancelled track selection', ephemeral: true });
                const button = <MessageButton>message.components[1].components[2];
                const skipToTrackButton = button.setCustomId('skip_to_track').setStyle('DANGER').setLabel('Skip to Track');
                rows[1].components[2] = skipToTrackButton;
                return message.edit({ components: rows })
            }
            case 'add_tracks': {
                const modal = this.client.util.modal()
                    .setCustomId('add_tracks_modal')
                    .setTitle('Adding Track(s) to the queue')
                    .addComponents([
                        this.client.util.textInput()
                            .setCustomId('track_query')
                            .setLabel('Track/Playlist URL or a name')
                            .setStyle('SHORT')
                            .setMinLength(1)
                            .setMaxLength(100)
                            .setRequired(true)
                    ]);

                this.client.util.showModal(modal, { client: this.client, interaction });
                break;
            }
            case 'enable_filters': {
                const rows = message.components;
                if (rows[3] && rows[3].components[0].customId === 'select_track') return interaction.reply({ content: 'You are selecting a track, choose or cancel to enable filters', ephemeral: true });
                if (rows[3] && rows[3].components[0].customId === 'select_filter_disable') return interaction.reply({ content: 'You are selecting filter to disable, choose or cancel to enable filters', ephemeral: true });
                const disabledFilters = queue.getFiltersDisabled().length > 0 ? queue.getFiltersDisabled()
                    .filter(filter =>
                        filter != 'bassboost_high' &&
                        filter != 'bassboost_low' &&
                        filter != 'chorus2d' &&
                        filter != 'chorus3d' &&
                        filter != 'earrape' &&
                        filter != 'fadein' &&
                        filter != 'normalizer2' &&
                        filter != 'mono' &&
                        filter != 'mstlr' &&
                        filter != 'mstrr'
                    ) : null;

                if (!disabledFilters) return interaction.reply({ content: 'All filters are enabled', ephemeral: true });

                const mapped = disabledFilters.map(filter => {
                    return {
                        label: this.client.util.capFirstLetter(filter),
                        value: filter,
                    }
                });

                const button = <MessageButton>message.components[2].components[1];
                const cancelButton = button
                    .setCustomId('cancel_filter_enabling')
                    .setLabel('Cancel Filter Enabling')
                    .setStyle('SECONDARY');

                const selectMenu = this.client.util.selectMenu()
                    .setCustomId('select_filter_enable')
                    .setPlaceholder('Select a filter to enable')
                    .setMinValues(1)
                    .setMaxValues(mapped.length)
                    .setOptions(mapped);

                message.components[2].components[1] = cancelButton;

                rows.push(
                    this.client.util.actionRow()
                        .addComponents(selectMenu)
                );

                message.edit({ components: rows });
                return interaction.reply({ content: 'Select from above', ephemeral: true });
            }
            case 'cancel_filter_enabling': {
                if (!message.components[3] || message.components[3].components[0].customId !== 'select_filter_enable') return interaction.reply({ content: 'There is no filter selection', ephemeral: true });
                const rows = [message.components[0], message.components[1], message.components[2]];

                interaction.reply({ content: 'Cancelled filter enabling', ephemeral: true });
                const button = <MessageButton>rows[2].components[1];
                const enableFilterButton = button.setCustomId('enable_filters').setStyle('SUCCESS').setLabel('Enable Filter(s)');
                rows[2].components[1] = enableFilterButton;
                return message.edit({ components: rows })
            }
            case 'disable_filters': {
                if (queue.getFiltersEnabled().length < 1) return interaction.reply({ content: 'There are no filters enabled', ephemeral: true });
                const rows = message.components;
                if (rows[3] && rows[3].components[0].customId === 'select_track') return interaction.reply({ content: 'You are selecting a track, choose or cancel to disable filters', ephemeral: true });
                if (rows[3] && rows[3].components[0].customId === 'select_filter_enable') return interaction.reply({ content: 'You are selecting filter to enable, choose or cancel to disable filters', ephemeral: true });

                const enabledFilters = queue.getFiltersEnabled();

                const mapped = enabledFilters.map(filter => {
                    return {
                        label: this.client.util.capFirstLetter(filter),
                        value: filter,
                    }
                });

                const button = <MessageButton>rows[2].components[2];
                const cancelButton = button
                    .setCustomId('cancel_filter_disabling')
                    .setLabel('Cancel Filter Disabling')
                    .setStyle('SECONDARY');

                const selectMenu = this.client.util.selectMenu()
                    .setCustomId('select_filter_disable')
                    .setPlaceholder('Select as filter to disable')
                    .setMaxValues(1)
                    .setMaxValues(mapped.length)
                    .setOptions(mapped);

                rows[2].components[2] = cancelButton;

                rows.push(
                    this.client.util.actionRow()
                        .addComponents(selectMenu)
                );

                message.edit({ components: rows });
                return interaction.reply({ content: 'Select from above', ephemeral: true });
            }
            case 'cancel_filter_disabling': {
                if (!message.components[3] || message.components[3].components[0].customId !== 'select_filter_disable') return interaction.reply({ content: 'There is no filter selection', ephemeral: true });
                const rows = [message.components[0], message.components[1], message.components[2]];

                interaction.reply({ content: 'Cancelled filter disabling', ephemeral: true });
                const button = <MessageButton>rows[2].components[2];
                const disableFilterButton = button.setCustomId('disable_filters').setLabel('Disable Filter(s)').setStyle('DANGER');
                rows[2].components[2] = disableFilterButton;
                return message.edit({ components: rows });
            }
        }
    }
}