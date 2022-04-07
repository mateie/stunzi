import Client from "@classes/Client";
import Valorant from '@classes/games/Valorant'
import { CommandInteraction, MessageEmbed, Message, MessageActionRow } from "discord.js";
import { CurrentOffersResponse } from "valclient.js";
import { LoadoutResponse } from "valclient.js/dist/cjs/interfaces/loadout";

export default class Util {
    client: Client;
    valorant: Valorant;

    constructor(client: Client) {
        this.client = client;
        this.valorant = client.valorant;
    }

    async skinsEmbed(interaction: CommandInteraction, offers: CurrentOffersResponse, timeout = 12000) {
        let page = 0;

        const { SkinsPanelLayout } = offers;

        const buttons = [
            this.client.util.button()
                .setCustomId('store_prev_item')
                .setLabel('⬅️')
                .setStyle('SECONDARY'),
            this.client.util.button()
                .setCustomId('store_next_item')
                .setLabel('➡️')
                .setStyle('SECONDARY'),
        ];

        const row = this.client.util.row().addComponents(buttons);

        const promises = SkinsPanelLayout.SingleItemOffers.map(async item => {
            const { data } = await this.valorant.assets.getSkinLevels(item);
            const refreshTime = Math.floor((Date.now() / 1000) + SkinsPanelLayout.SingleItemOffersRemainingDurationInSeconds);
            const embed = this.client.util.embed()
                .setTitle(`Item: ${data.displayName}`)
                .setDescription(`**Refreshes <t:${refreshTime}:R>**`)
                .setImage(data.displayIcon);
            return embed;
        });

        const embeds: MessageEmbed[] = await Promise.all(promises);

        if (interaction.deferred === false) {
            await interaction.deferReply();
        }

        const currPage = <Message>await interaction.editReply({
            embeds: [embeds[page]],
            components: [row],
        });

        const filter = (i: { customId: string | null; }) =>
            i.customId === buttons[0].customId ||
            i.customId === buttons[1].customId;

        const collector = currPage.createMessageComponentCollector({
            filter,
            time: timeout,
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
        }).on('end', (_, reason) => {
            if (reason !== 'messageDelete') {
                const disabledRow = this.client.util.row().addComponents(
                    buttons[0].setDisabled(true),
                    buttons[1].setDisabled(true)
                );

                currPage.edit({
                    embeds: [embeds[page]],
                    components: [disabledRow],
                });
            }
        });
    }

    async inventoryEmbed(interaction: CommandInteraction, items: LoadoutResponse, timeout = 12000) {
        let page = 0;

        const topButtons = [
            this.client.util.button()
                .setCustomId('inventory_prev_item')
                .setLabel('⬅️')
                .setStyle('SECONDARY'),
            this.client.util.button()
                .setCustomId('inventory_next_item')
                .setLabel('➡️')
                .setStyle('SECONDARY'),
        ];

        const bottomButtons = [
            this.client.util.button()
                .setCustomId('inventory_identity')
                .setLabel('Identity')
                .setStyle('PRIMARY'),
            this.client.util.button()
                .setCustomId('inventory_gun_skins')
                .setLabel('Gun Skins')
                .setStyle('DANGER'),
            this.client.util.button()
                .setCustomId('inventory_sprays')
                .setLabel('Sprays')
                .setStyle('SUCCESS'),
            this.client.util.button()
                .setCustomId('inventory_cancel_embed')
                .setLabel('⛔')
                .setStyle('SECONDARY')
        ];

        const topRow = this.client.util.row().addComponents(topButtons);
        const bottomRow = this.client.util.row().addComponents(bottomButtons);

        const { Identity, Guns, Sprays } = items;

        const pageFilters = (i: { customId: string | null; }) =>
            i.customId === topButtons[0].customId ||
            i.customId === topButtons[1].customId;

        const menuFilters = (i: { customId: string | null; }) =>
            i.customId === bottomButtons[0].customId ||
            i.customId === bottomButtons[1].customId ||
            i.customId === bottomButtons[2].customId ||
            i.customId === bottomButtons[3].customId;


        if (interaction.deferred === false) {
            await interaction.deferReply();
        }

        const currPage = <Message>await interaction.editReply({
            components: [bottomRow]
        });

        const pageCollector = currPage.createMessageComponentCollector({
            filter: pageFilters,
            time: timeout
        });

        const menuCollector = currPage.createMessageComponentCollector({
            filter: menuFilters,
            time: timeout
        });

        let embeds: string | any[];

        pageCollector
            .on('collect', async (i) => {
                switch (i.customId) {
                    case topButtons[0].customId:
                        page = page > 0 ? --page : embeds.length - 1;

                        await i.deferUpdate();
                        await i.editReply({
                            embeds: [embeds[page]],
                            components: [topRow, bottomRow]
                        });
                        break;
                    case topButtons[1].customId:
                        page = page + 1 < embeds.length ? ++page : 0;

                        await i.deferUpdate();
                        await i.editReply({
                            embeds: [embeds[page]],
                            components: [topRow, bottomRow]
                        });
                        break;
                }
            });

        menuCollector
            .on('collect', async (i: { customId: any; deferUpdate: () => any; editReply: (arg0: { embeds: MessageEmbed[]; components: MessageActionRow[]; }) => any; }) => {
                switch (i.customId) {
                    case bottomButtons[0].customId:
                        const { data: { largeArt: playerCard } } = await this.valorant.assets.getPlayerCards(Identity.PlayerCardID).catch(console.error);
                        const { data: { titleText: playerTitle } } = await this.valorant.assets.getPlayerTitles(Identity.PlayerTitleID).catch(console.error);
                        const accountLevel = Identity.HideAccountLevel ? 'Hidden' : Identity.AccountLevel;
                        const embed =
                            this.client.util.embed()
                                .setTitle(playerTitle)
                                .setImage(playerCard)
                                .setDescription(`Account Level: ${accountLevel}`);

                        await i.deferUpdate();
                        await i.editReply({
                            embeds: [embed],
                            components: [bottomRow]
                        });

                        break;
                    case bottomButtons[1].customId:
                        const promisesSkins = Object.values(Guns).map(async item => {
                            const { data: skin } = await this.valorant.assets.getSkins(item.SkinID);
                            const { data: skinChroma } = await this.valorant.assets.getSkinChromas(item.ChromaID);
                            const embed = this.client.util.embed()
                                .setTitle(skin.displayName)
                                .setImage(skinChroma.fullRender);

                            return embed;
                        });

                        embeds = await Promise.all(promisesSkins);

                        page = 0;

                        await i.deferUpdate();
                        await i.editReply({
                            embeds: [embeds[page]],
                            components: [topRow, bottomRow]
                        });

                        break;
                    case bottomButtons[2].customId:
                        const promisesSprays = Object.values(Sprays).map(async item => {
                            const { data: spray } = await this.valorant.assets.getSprays(item.SprayID);
                            const embed = this.client.util.embed()
                                .setTitle(spray.displayName)
                                .setImage(spray.animationGif ? spray.animationGif : spray.fullTransparentIcon);

                            return embed;
                        });

                        embeds = await Promise.all(promisesSprays);

                        page = 0;

                        await i.deferUpdate();
                        await i.editReply({
                            embeds: [embeds[page]],
                            components: [topRow, bottomRow]
                        });

                        break;
                    case bottomButtons[3].customId:
                        interaction.deleteReply();
                        pageCollector.stop();
                        return menuCollector.stop();
                }

                menuCollector.resetTimer();
            });
    }

}