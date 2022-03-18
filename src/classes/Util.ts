import { BufferResolvable, ButtonInteraction, CommandInteraction, GuildMember, Interaction, Message, MessageActionRow, MessageAttachment, MessageButton, MessageEmbed } from "discord.js";
import Client from "./Client";

import { Modal, TextInputComponent, showModal } from 'discord-modals';
import { Stream } from "stream";
import { RawMessageAttachmentData } from "discord.js/typings/rawDataTypes";

export default class Util {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    actionRow(): MessageActionRow {
        return new MessageActionRow();
    }

    button(): MessageButton {
        return new MessageButton();
    }

    modal(): Object {
        return {
            component: new Modal(),
            show: showModal
        };
    }

    textInput(): TextInputComponent {
        return new TextInputComponent();
    }

    embed(): MessageEmbed {
        return new MessageEmbed()
            .setColor('PURPLE')
            .setTimestamp(new Date())
            .setFooter({ text: 'Owned by Stealth and Bunzi' });
    }

    attachment(attachment: BufferResolvable | Stream, name?: string, data?: RawMessageAttachmentData): MessageAttachment {
        return new MessageAttachment(attachment, name, data);
    }

    async memberActionRow(executer: GuildMember, member: GuildMember): Promise<any> {
        const blocked: boolean = false;
        const muted: boolean = false;

        const topRow = this.actionRow()
            .addComponents(
                this.button()
                    .setCustomId(`show_card`)
                    .setLabel('Show Card')
                    .setStyle('SECONDARY'),
            );

        const midRow = this.actionRow()
            .addComponents(
                this.button()
                    .setCustomId(`show_warns`)
                    .setLabel('Show Warns')
                    .setStyle('PRIMARY'),
                this.button()
                    .setCustomId(`show_blocks`)
                    .setLabel('Show Blocks')
                    .setStyle('PRIMARY'),
                this.button()
                    .setCustomId(`show_mutes`)
                    .setLabel('Show Mutes')
                    .setStyle('PRIMARY'),
            );

        const bottomRow = this.actionRow()
            .addComponents(
                this.button()
                    .setCustomId(`warn_member`)
                    .setLabel('Warn Member')
                    .setStyle('DANGER'),
                this.button()
                    .setCustomId(blocked ? `unblock_member` : `block_member`)
                    .setLabel(blocked ? 'Unblock Member' : 'Block Member')
                    .setStyle(blocked ? 'SUCCESS' : 'DANGER'),
                this.button()
                    .setCustomId(muted ? `unmute_member` : `mute_member`)
                    .setLabel(muted ? 'Unmute Member' : 'Mute Member')
                    .setStyle(muted ? 'SUCCESS' : 'DANGER'),
            );

        return executer.permissions.has('VIEW_AUDIT_LOG') ? [topRow, midRow, bottomRow] : [topRow];
    }

    async pagination(interaction: ButtonInteraction | CommandInteraction, contents: Array<string>, title?: string, ephemeral: boolean = false, timeout: number = 12000) {
        let page = 0;

        const buttons = [
            this.button()
                .setCustomId('previous_page')
                .setLabel('⬅️')
                .setStyle('SECONDARY'),
            this.button()
                .setCustomId('next_page')
                .setLabel('➡️')
                .setStyle('SECONDARY')
        ];

        const row = this.actionRow().addComponents(buttons);

        const embeds = contents.map((content, index) => {
            const embed = this.embed()
                .setDescription(content)
                .setFooter({ text: `Page ${index + 1} of ${contents.length}` });
            if (title) embed.setTitle(title);

            return embed;
        });

        if (interaction.deferred === false) {
            await interaction.deferReply();
        }

        const currPage: Message = <Message>await interaction.editReply({
            embeds: [embeds[page]],
            components: [row],
        });

        const filter = (i: { customId: string | null; }) =>
            i.customId === buttons[0].customId ||
            i.customId === buttons[1].customId;

        const collector = await currPage.createMessageComponentCollector({
            filter,
            time: timeout
        });

        collector.on('collect', async i => {
            switch (i.customId) {
                case buttons[0].customId:
                    page = page > 0 ? --page : embeds.length - 1;
                    break;
                case buttons[1].customId:
                    page = page + 1 < embeds.length ? ++page : 0;
                    break;
                default:
                    break;
            }

            await i.deferUpdate();
            await i.editReply({
                embeds: [embeds[page]],
                components: [row],
            });
            collector.resetTimer();
        })
            .on('end', (_, reason) => {
                if (reason !== 'messageDelete') {
                    const disabledRow = this.actionRow().addComponents(
                        buttons[0].setDisabled(true),
                        buttons[1].setDisabled(true)
                    );

                    currPage.edit({
                        embeds: [embeds[page]],
                        components: [disabledRow],
                    });
                }
            });

        return currPage;
    }
}