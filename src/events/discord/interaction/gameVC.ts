import { ButtonInteraction, CategoryChannel, Guild, GuildMember, Message, VoiceChannel, VoiceState } from "discord.js";
import Client from "@classes/Client";
import Event from "@classes/Event";
import IEvent from "@interfaces/IEvent";

import categories from "@data/categories";
import channels from "@data/channels";
import games from "@data/games";

export default class GameVCEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'interactionCreate';
    }

    async run(interaction: ButtonInteraction) {
        if (!interaction.isButton()) return;

        const { customId } = interaction;

        if (!games.map(game => `${game}-vc`).includes(customId)) return;

        const member = <GuildMember>interaction.member;
        const guild = <Guild>interaction.guild;
        const memberVoice = <VoiceState>member.voice;
        const joinVChannel = <VoiceChannel>guild.channels.cache.get(channels.voice.createAVC);

        if (!this.client.tempCreateVC.get(member.id)) return interaction.reply({ content: `You have to join ${joinVChannel} to create Game Voice Channels`, ephemeral: true });

        switch (customId) {
            case 'valorant-vc': {
                const embed = this.client.util.embed()
                    .setTitle('Valorant VC Creation')
                    .setColor('RED')
                    .setDescription('Choose the game mode\n\n**Just select one of them from the dropdown below :>**');

                const row = this.client.util.row().addComponents(
                    this.client.util.button()
                        .setCustomId('valorant-unrated-vc')
                        .setLabel('Unrated')
                        .setStyle('SUCCESS'),
                    this.client.util.button()
                        .setCustomId('valorant-competitive-vc')
                        .setLabel('Competitive')
                        .setStyle('DANGER'),
                    this.client.util.button()
                        .setCustomId('valorant-custom-vc')
                        .setLabel('Custom')
                        .setStyle('SECONDARY')
                );

                const message = <Message>await interaction.reply({ embeds: [embed], components: [row], ephemeral: true, fetchReply: true });
                message.createMessageComponentCollector({
                    componentType: 'BUTTON',
                    max: 1,
                })
                    .on('collect', async i => {
                        const category = <CategoryChannel>guild.channels.cache.get(categories.valorant);
                        const perms = category.permissionOverwrites.cache;
                        switch (i.customId) {
                            case 'valorant-unrated-vc': {
                                const unrateds = category.children.filter(channel => channel.name.includes('Unrated #'));
                                const unrated = await guild.channels.create(`Unrated #${unrateds.size + 1}`, {
                                    parent: category,
                                    type: 'GUILD_VOICE',
                                    position: 99,
                                    permissionOverwrites: perms,
                                    userLimit: 5,
                                });

                                await unrated.permissionOverwrites.create(memberVoice.id, { MOVE_MEMBERS: true });
                                this.client.tempCreateVC.delete(member.id);
                                await memberVoice.setChannel(unrated);
                                i.update({ content: `**Created *Unrated* channel for Valorant: ${unrated}**`, embeds: [], components: [] });
                                break;
                            }
                            case 'valorant-competitive-vc': {
                                const competitives = category.children.filter(channel => channel.name.includes('Competitive #'));
                                const competitive = await guild.channels.create(`Competitive #${competitives.size + 1}`, {
                                    parent: category,
                                    type: 'GUILD_VOICE',
                                    position: 99,
                                    permissionOverwrites: perms,
                                    userLimit: 5,
                                });

                                await competitive.permissionOverwrites.create(memberVoice.id, { MOVE_MEMBERS: true });
                                this.client.tempCreateVC.delete(member.id);
                                await memberVoice.setChannel(competitive);
                                i.update({ content: `**Created *Competitive* channel for Valorant: ${competitive}**`, embeds: [], components: [] });
                                break;
                            }
                            case 'valorant-custom-vc': {
                                const customs = category.children.filter(channel => channel.name.includes('Custom #'));
                                const custom = await guild.channels.create(`Custom #${customs.size + 1}`, {
                                    parent: category,
                                    type: 'GUILD_VOICE',
                                    position: 99,
                                    permissionOverwrites: perms,
                                    userLimit: 10,
                                });

                                await custom.permissionOverwrites.create(memberVoice.id, { MOVE_MEMBERS: true });
                                this.client.tempCreateVC.delete(member.id);
                                await memberVoice.setChannel(custom);
                                i.update({ content: `**Created *Custom* channel for Valorant: ${custom}**`, embeds: [], components: [] });
                                break;
                            }
                        }
                    });
                break;
            }
            case 'dead_by_daylight-vc': {
                const embed = this.client.util.embed()
                    .setTitle('Dead By Daylight VC Creation')
                    .setColor('DARK_RED')
                    .setDescription('Choose the game mode\n\n**Just select one of them from the dropdown below :>**');

                const row = this.client.util.row()
                    .addComponents(
                        this.client.util.button()
                            .setCustomId('dbd_swf_vc')
                            .setLabel('SWF (Survive With Friends)')
                            .setStyle('SUCCESS'),
                        this.client.util.button()
                            .setCustomId('dbd_kyf_vc')
                            .setLabel('KYF (Kill Your Friends)')
                            .setStyle('DANGER')
                    );

                const message = <Message>await interaction.reply({ embeds: [embed], components: [row], ephemeral: true, fetchReply: true });
                message.createMessageComponentCollector({
                    componentType: 'BUTTON',
                    max: 1,
                })
                    .on('collect', async i => {
                        const category = <CategoryChannel>guild.channels.cache.get(categories.dead_by_daylight);
                        const perms = category.permissionOverwrites.cache;
                        switch (i.customId) {
                            case 'dbd_swf_vc': {
                                const swfs = category.children.filter(channel => channel.name.includes('SWF #'));
                                const swf = await guild.channels.create(`SWF #${swfs.size + 1}`, {
                                    parent: category,
                                    type: 'GUILD_VOICE',
                                    position: 99,
                                    permissionOverwrites: perms,
                                    userLimit: 4,
                                });

                                await swf.permissionOverwrites.create(memberVoice.id, { MOVE_MEMBERS: true });
                                this.client.tempCreateVC.delete(member.id);
                                await memberVoice.setChannel(swf);
                                i.update({ content: `**Created *SWF (Survive With Friends)* channel for Dead by Daylight: ${swf}**`, embeds: [], components: [] });
                                break;
                            }
                            case 'dbd_kyf_vc': {
                                const kyfs = category.children.filter(channel => channel.name.includes('KYF #'));
                                const kyf = await guild.channels.create(`KYF #${kyfs.size + 1}`, {
                                    parent: category,
                                    type: 'GUILD_VOICE',
                                    position: 99,
                                    permissionOverwrites: perms,
                                    userLimit: 5,
                                });

                                await kyf.permissionOverwrites.create(memberVoice.id, { MOVE_MEMBERS: true });
                                this.client.tempCreateVC.delete(member.id);
                                await memberVoice.setChannel(kyf);
                                i.update({ content: `**Created *KYF (Kill Your Friends)* channel for Dead by Daylight: ${kyf}**`, embeds: [], components: [] });
                                break;
                            }
                        }
                    });
                break;
            }
            case 'minecraft-vc': {
                const category = <CategoryChannel>guild.channels.cache.get(categories.minecraft);
                const channels = category.children.filter(channel => channel.name.includes('Minecraft #'));
                const perms = category.permissionOverwrites.cache;
                const mc = await guild.channels.create(`Minecraft #${channels.size + 1}`, {
                    parent: category,
                    type: 'GUILD_VOICE',
                    position: 99,
                    permissionOverwrites: perms,
                });

                await mc.permissionOverwrites.create(memberVoice.id, { MOVE_MEMBERS: true });
                this.client.tempCreateVC.delete(member.id);
                await memberVoice.setChannel(mc);
                return interaction.reply({ content: `**Created Minecraft channel: ${mc}**`, ephemeral: true });
            }
        }
    }
}