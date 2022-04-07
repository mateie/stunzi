import { CommandEvent } from "@scriptserver/command";
import { GuildMember } from "discord.js";
import Client from "@classes/Client";
import IMineCommand from "@interfaces/IMineCommand";
import MineCommand from "@classes/games/minecraft/MineCommand";

import roles from "@data/roles";

import MinecraftMember from "@schemas/MinecraftMember";

import { MojangClient } from "@tecc/mojang.js";
import crafatar from 'crafatar';

const mojang = new MojangClient();

export default class LinkMineCommand extends MineCommand implements IMineCommand {
    constructor(client: Client) {
        super(client);

        this.name = 'link';
        this.usage = ['<discord_tag> (example#0132)'];
    }

    async run(command: CommandEvent, args: string[]) {
        const { player } = command;
        if (args.length < 1 || args.includes('')) return this.missingArgs(command, this.usage);
        if (!args[0].includes('#')) return this.missingArgs(command, this.usage);

        const member = <GuildMember>this.client.mainGuild.members.cache.find((m: GuildMember) => m.user.tag.toLowerCase() === args[0].toLowerCase());
        if (!member) return this.server.util.tellRaw('Member not found on discord, make sure your username is correct', player);

        const minecraftMember = await MinecraftMember.findOne({ minecraftUsername: player, memberId: member.id });
        if (minecraftMember) return this.server.util.tellRaw('The accounts are already linked');

        if (!member.roles.cache.has(roles.games.minecraft_role)) return this.client.minecraft.rconConnection.util.tellRaw(`You don't have Minecraft Role on the Discord server, make sure to get it and try again`);

        const { id: uuid } = await mojang.getUuid(player);

        const avatar = await crafatar.getAvatar(uuid);

        const row = this.client.util.row()
            .addComponents(
                this.client.util.button()
                    .setCustomId('confirm_smp_link')
                    .setLabel('Confirm')
                    .setStyle('SUCCESS'),
                this.client.util.button()
                    .setCustomId('deny_smp_link')
                    .setLabel('Deny')
                    .setStyle('DANGER')
            );

        const embed = this.client.util.embed()
            .setAuthor({ name: player, iconURL: avatar })
            .setTitle(`Discord + SMP Link`)
            .setDescription(`
                You are linking your minecraft username with your discord

                ***IF YOU DID NOT REQUEST THIS, LET THE ADMINS KNOW, SO THEY CAN CAN PREVENT THIS FROM HAPPENING AGAIN***
            `)
            .setThumbnail(avatar);

        const message = await member.send({ embeds: [embed], components: [row] });

        const filter = (i: any) => i.customId === 'confirm_smp_link' || i.customId === 'deny_smp_link';

        message.createMessageComponentCollector({
            filter,
            time: 15000,
            max: 1,
        })
            .on('collect', async i => {
                switch (i.customId) {
                    case 'confirm_smp_link': {
                        await MinecraftMember.create({
                            memberId: member.id,
                            discordUsername: member.user.tag,
                            minecraftUsername: player
                        });
                        embed.setColor('GREEN').setDescription('You successfully linked your minecraft username to your discord. Enjoy extra features :>');
                        message.edit({ embeds: [embed], components: [] });
                        this.client.minecraft.rconConnection.send(`tellraw ${player} {"text":"You successfully linked","italic":true,"underlined":true,"color":"gold"}`);
                        break;
                    }
                    case 'deny_smp_link': {
                        embed.setColor('RED').setDescription('You denied request to link your minecraft username to your discord');
                        message.edit({ embeds: [embed], components: [] });
                        this.client.minecraft.rconConnection.send(`tellraw ${player} {"text":"Your request was denied, make sure you ented correct discord tag","bold":true,"italic":true,"underlined":true,"color":"#FF7F85"}`);
                        break;
                    }
                }
            })
            .on('end', () => {
                embed.setDescription('Time expired')
                message.edit({ embeds: [embed], components: [] });
            });
    }
}