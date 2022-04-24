import Client from '@classes/Client';

import { Entitlements, Offer, ValClient, YourItems } from 'valclient.js';
import { Collection, CommandInteraction, GuildMember, Message, MessageAttachment, MessageComponentInteraction, MessageEmbed } from 'discord.js';
import { Regions } from 'valclient.js/dist/cjs/types/resources';
import ValorantAssets from 'valorant-api-js';

import Util from './valorant/Util';
import { skinsIdMappedByGunName } from 'valclient.js/dist/cjs/resources/skins';
import { UploadApiResponse } from 'cloudinary';
import { GunsType, Levels, SkinsType } from 'valclient.js/dist/cjs/types/loadout';
import { VariantSkin } from 'valclient.js/dist/cjs/types/chroma';

export default class Valorant {
    client: Client;
    util: Util;
    assets: any;

    accounts: Collection<string, ValClient>;

    constructor(client: Client) {
        this.client = client;
        this.util = new Util(client);

        this.assets = new ValorantAssets();
        this.accounts = new Collection();
    }

    async getStore(interaction: CommandInteraction, account: ValClient) {
        const allStoreItems = await account.store?.offers();
        const storeItems = await account.store?.currentOffers();

        const store: { items: Offer[], remaining: number } = {
            items: [],
            remaining: <number>storeItems?.SkinsPanelLayout.SingleItemOffersRemainingDurationInSeconds,
        };

        storeItems?.SkinsPanelLayout.SingleItemOffers.forEach(id => store.items.push(<Offer>allStoreItems?.Offers.find(item => item.OfferID === id)));

        return this.util.skinsEmbed(interaction, store);
    }

    async changeSkin(interaction: CommandInteraction, weapon: string, account: ValClient) {
        const member = <GuildMember>interaction.member;

        let page = 0;

        const skins = Object.values(skinsIdMappedByGunName[weapon as keyof typeof skinsIdMappedByGunName]);

        const allSkins = await Promise.all(skins.map(async (id: string) => {
            const { data } = await this.assets.getSkins(id);
            return data;
        }));

        const playerLevels = <YourItems<Entitlements>>await account.store?.yourItems('skin_level');

        const playerSkins: Collection<string, any> = new Collection();

        playerLevels.Entitlements.forEach((item: any) => {
            allSkins.forEach(skin => {
                skin.levels.forEach((level: any) => {
                    if (level.uuid === item.ItemID) playerSkins.set(skin.displayName, skin);
                });
            });
        });

        if (playerSkins.size < 1) return interaction.reply({ content: `Couldn't find skins for ${weapon} in your loadout`, ephemeral: true });

        const buttons = [
            this.client.util.button()
                .setCustomId('nav_previous')
                .setLabel('Previous')
                .setStyle('SECONDARY'),
            this.client.util.button()
                .setCustomId('select_skin')
                .setLabel('Select')
                .setStyle('SUCCESS'),
            this.client.util.button()
                .setCustomId('cancel_selection')
                .setLabel('Cancel')
                .setStyle('DANGER'),
            this.client.util.button()
                .setCustomId('nav_next')
                .setLabel('Next')
                .setStyle('SECONDARY')
        ];

        const row = this.client.util.row().setComponents(buttons);

        if (interaction.deferred === false) {
            await interaction.deferReply();
        }

        let embeds = playerSkins.map((skin: any) => {
            return this.client.util.embed()
                .setAuthor({ name: skin.displayName })
                .setTitle(`You have ${playerSkins.size} skins for ${weapon} *Except Defaults*`)
                .setImage(skin.displayIcon);
        });

        let attachments: MessageAttachment[] = [];

        const message = <Message>await interaction.editReply({
            embeds: [embeds[page]],
            components: [row],
        });

        const filter = (i: MessageComponentInteraction) =>
            (i.customId === 'nav_previous' ||
                i.customId === 'nav_next' ||
                i.customId === 'select_skin' ||
                i.customId === 'select_level' ||
                i.customId === 'select_color' ||
                i.customId === 'cancel_selection') &&
            member.id === i.user.id;

        const dWeapon = <GunsType>weapon;
        let dSkin: SkinsType<GunsType> | null = null;
        let dLevel = <Levels>'Level 1';
        let dColor = <VariantSkin<SkinsType<GunsType>>>'Default';

        const collector = message.createMessageComponentCollector({
            filter,
        })
            .on('collect', async i => {
                switch (i.customId) {
                case 'nav_previous': {
                    buttons.forEach(button => button.setDisabled(true));
                    row.setComponents(buttons);
                    await message.edit({
                        components: [row],
                    });

                    page = page > 0 ? --page : embeds.length - 1;

                    await i.deferUpdate();
                    await i.editReply({
                        embeds: [embeds[page]],
                        files: attachments[page] ? [attachments[page]] : [],
                        components: [row.setComponents(buttons.map(button => button.setDisabled(false)))],
                    });
                    break;
                }
                case 'nav_next': {
                    buttons.forEach(button => button.setDisabled(true));
                    row.setComponents(buttons);
                    await message.edit({
                        components: [row],
                    });

                    page = page + 1 < embeds.length ? ++page : 0;

                    await i.deferUpdate();
                    await i.editReply({
                        embeds: [embeds[page]],
                        files: attachments[page] ? [attachments[page]] : [],
                        components: [row.setComponents(buttons.map(button => button.setDisabled(false)))],
                    });
                    break;
                }
                case 'cancel_selection': {
                    await i.deferUpdate();
                    await i.deleteReply();
                    break;
                }
                case 'select_skin': {
                    await i.deferUpdate();

                    const cEmbed = <MessageEmbed>embeds[page];
                    const chosenSkin = playerSkins.get(<string>cEmbed.author?.name);

                    page = 0;

                    dSkin = <SkinsType<GunsType>>chosenSkin.displayName;

                    if (chosenSkin.levels.length > 1) {
                        cEmbed.setDescription('***Fetching Levels, Please Wait...***');
                        row.components.forEach(button => button.setDisabled(true));
                        row.setComponents(buttons);

                        buttons[1].setCustomId('select_level');

                        const levels = chosenSkin.levels;

                        message.edit({ components: [row], embeds: [cEmbed] });

                        embeds = levels.map((level: any, index: number) => {
                            return this.client.util.embed()
                                .setAuthor({ name: chosenSkin.displayName })
                                .setTitle(`Level ${index + 1}`);
                        });

                        attachments = await Promise.all(levels.map(async (level: any, index: number) => {
                            try {
                                const video = <UploadApiResponse>await this.client.cloudinary.getSkinVideos(member, level);
                                return this.client.util.attachment(video.secure_url, `${member.id}_${level.displayName.replace(' ', '_')}.mp4`);
                            } catch (err) {
                                console.error(err);
                                embeds[index].setDescription(this.client.util.embedURL('Video for the level', level.streamedVideo));
                                return null;
                            }
                        }));

                        await message.edit({
                            embeds: [embeds[page]],
                            files: attachments[page] ? [attachments[page]] : [],
                            components: [row.setComponents(buttons.map(button => button.setDisabled(false)))],
                        });
                    } else {
                        attachments = [];

                        if (chosenSkin.chromas.length > 1) {
                            buttons[1].setCustomId('select_color');

                            const colors = chosenSkin.chromas;

                            message.edit({ components: [row], embeds: [cEmbed] });

                            embeds = colors.map((color: any) => {
                                const colorName = color.displayName.split('\n')[1] ? color.displayName.split('\n')[1].replace('(', '').replace(')', '') : 'Default';
                                return this.client.util.embed()
                                    .setAuthor({ name: chosenSkin.displayName })
                                    .setTitle(colorName)
                                    .setImage(color.fullRender);
                            });

                            await message.edit({
                                embeds: [embeds[page]],
                                attachments: [],
                                components: [row]
                            });
                        } else {
                            collector.stop();
                        }
                    }
                    break;
                }
                case 'select_level': {
                    await i.deferUpdate();

                    attachments = [];

                    const cEmbed = <MessageEmbed>embeds[page];
                    const chosenSkin = playerSkins.get(<string>cEmbed.author?.name);

                    page = 0;

                    const chosenLevel = chosenSkin.levels.find((level: any) => level.displayName.includes(cEmbed.title));
                    dLevel = chosenLevel.displayName.includes('Level') ? chosenLevel.displayName.split(' ').slice(-2).join(' ') : 'Level 1';

                    if (chosenSkin.chromas.length > 1) {
                        buttons[1].setCustomId('select_color');

                        const colors = chosenSkin.chromas;

                        message.edit({ components: [row], embeds: [cEmbed] });

                        embeds = colors.map((color: any) => {
                            const colorName = color.displayName.split('\n')[1] ? color.displayName.split('\n')[1].replace('(', '').replace(')', '') : 'Default';
                            return this.client.util.embed()
                                .setAuthor({ name: chosenSkin.displayName })
                                .setTitle(colorName)
                                .setImage(color.fullRender);
                        });

                        await message.edit({
                            embeds: [embeds[page]],
                            attachments: [],
                            components: [row]
                        });
                    } else {
                        collector.stop();
                    }
                    break;
                }
                case 'select_color': {
                    await i.deferUpdate();

                    const cEmbed = <MessageEmbed>embeds[page];
                    const chosenSkin = playerSkins.get(<string>cEmbed.author?.name);

                    page = 0;

                    const chosenColor = chosenSkin.chromas.find((chroma: any) => chroma.displayName.includes(cEmbed.title));
                    dColor = chosenColor ? chosenColor.displayName.split('\n')[1].replace('(', '').replace(')', '').split(' ')[2] : 'Default';
                    collector.stop('finished');
                }
                }
            })
            .on('end', async (i, reason) => {
                switch (reason) {
                case 'finished': {
                    await account.loadout?.changeGunSkin(dWeapon, <SkinsType<GunsType>>dSkin, dLevel, dColor);
                    const int = <MessageComponentInteraction>i.last();
                    await int.editReply({
                        content: `Skin for ***${dWeapon}*** was set to: ***Skin*** - **${dSkin}**, ***Level*** - **${dLevel}**, ***Color*** - **${dColor}**`,
                        embeds: [],
                        attachments: [],
                        components: [],
                    });
                    break;
                }
                }
            });
    }

    async login(member: GuildMember, username: string, password: string, region: Regions) {
        const auth = new ValClient();

        try {
            await auth.init({
                auth: {
                    username,
                    password: this.client.cypher.decrypt(password),
                },
                region,
            });

            this.accounts.set(member.id, auth);
            return true;
        } catch (err: any) {
            console.error(err);
            return err;
        }
    }
}