import { CommandInteraction, Guild, GuildMember } from "discord.js";
import { Regions } from "@mateie/valclient.js/dist/cjs/types/resources";
import Client from "../../classes/Client";
import Command from "../../classes/Command";
import ICommand from "../../classes/interfaces/ICommand";

export default class ValorantCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('valorant')
            .setDescription('Valorant Stuff')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('login')
                    .setDescription('Login to your valorant account (WE DO NOT KEEP ANY INFORMATION)')
                    .addStringOption(option =>
                        option
                            .setName('username')
                            .setDescription('Your Valorant Username')
                            .setRequired(true)
                    )
                    .addStringOption(option =>
                        option
                            .setName('password')
                            .setDescription('Your Valorant Password (WE DO NOT STORE IT)')
                            .setRequired(true)
                    )
                    .addStringOption(option =>
                        option
                            .setName('region')
                            .setDescription('Specify which region you are in')
                            .addChoices([
                                ['NA', 'na'],
                                ['EU', 'eu'],
                                ['AP', 'ap'],
                                ['KR', 'kr']
                            ])
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('store')
                    .setDescription('Your Valorant Store')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('wallet')
                    .setDescription('Your Valorant Wallet (VP, Radianite, etc)')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('inventory')
                    .setDescription('Check your valorant inventory')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('logout')
                    .setDescription('Logout from your account')
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;
        const member = <GuildMember>interaction.member;
        if (member.id !== this.client.owners[0]) return interaction.reply({ content: 'This command is disabled for now', ephemeral: true });
        const subcommand = options.getSubcommand();
        switch (subcommand) {
            case 'login': {
                const username = <string>options.getString('username')?.toLowerCase();
                const password = this.client.cypher.encrypt(<string>options.getString('password'));
                const region = <Regions>options.getString('region');

                const success = await this.client.valorant.login(member, username, password, region);
                if (success) return interaction.reply({ content: 'Logged in successfully', ephemeral: true });
                else return interaction.reply({ content: 'Couldn\'t log in, contact the owner', ephemeral: true });
            }
            case 'store': {
                console.log(this.client.valorantAuth.get(member.id));
            }
            /*case 'store': {
                const isLogged = await this.client.valorant.isAuthenticated(member);
                if (!isLogged) return interaction.reply({ content: 'You are not logged in', ephemeral: true });
                if (!member.valorant) return interaction.reply({ content: 'Something went wrong, please try again', ephemeral: true });
                const store = await member.valorant.storeApi.getStorefront(
                    member.valorant.user.Subject,
                    true,
                    'en-US'
                );

                if (!store) return interaction.reply({ content: 'Could not fetch the store, please try again', ephemeral: true });

                const { skins } = store;
                this.client.valorant.skinsEmbed(interaction, skins);
                break;
            }
            case 'wallet': {
                const isLogged = await this.client.valorant.isAuthenticated(member);
                if (!isLogged) return interaction.reply({ content: 'You are not logged in', ephemeral: true });
                if (!member.valorant) return interaction.reply({ content: 'Something went wrong, please try again', ephemeral: true });
                const wallet = await member.valorant.storeApi.getWallet(member.valorant.user.Subject).catch(console.error);
                if (!wallet) return interaction.reply({ content: 'Your wallet could not be fetched, please try again', ephemeral: true });
                const mapped = wallet.map((currency: { name: any; amount: any; }) => `**${currency.name}**: ${currency.amount}`);
                return interaction.reply({ content: mapped.join('\n'), ephemeral: true });
            }
            case 'inventory': {
                const isLogged = await this.client.valorant.isAuthenticated(member);
                if (!isLogged) return interaction.reply({ content: 'You are not logged in', ephemeral: true });
                if (!member.valorant) return interaction.reply({ content: 'Something went wrong, please try again', ephemeral: true });
                const inv = await member.valorant.playerApi.getInventory(member.valorant.user.Subject);
                if (!inv) return interaction.reply({ content: 'Your inventory could not be fetched, please try again', ephemeral: true });
                this.client.valorant.inventoryEmbed(interaction, inv);
                break;
            }
            case 'logout': {
                const isLogged = await this.client.valorant.isAuthenticated(member);
                if (!isLogged) return interaction.reply({ content: 'You are not logged in', ephemeral: true });
                if (!member.valorant) return interaction.reply({ content: 'Something went wrong, please try again', ephemeral: true });
                member.valorant = null;
                await ValorantDB.deleteOne({ memberId: member.id });
                return interaction.reply({ content: 'Logged out successfully', ephemeral: true });
            }*/
        }
    }
}
