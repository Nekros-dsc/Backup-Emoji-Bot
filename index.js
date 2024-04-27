const Discord = require('discord.js');
const { readFileSync, writeFileSync } = require('fs');
database = JSON.parse(readFileSync('./data.db'));
const { token, prefix, owners, color } = require('./config.json');
const client = new Discord.Client({
    intents: 3276799
});

function writeDatabase() {
    writeFileSync('./data.db', JSON.stringify(database));
}

client.login(token);
client.on('ready', () => {
    console.log(`[!] — Logged in as ${client.user.tag} (${client.user.id})`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args[0]?.toLowerCase();
    args.shift();

    if (command === 'load') {
        if (!owners.includes(message.author.id)) {
            const embed = new Discord.EmbedBuilder()
            .setTitle('`❌` ▸ Unauthorized user')
            .setDescription('*You are not authorized to use this command.*')
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setColor(color)
            .setTimestamp();
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
            }
        const id = args[0];
        if (!id) {
            const embed = new Discord.EmbedBuilder()
            .setTitle('`❌` ▸ Provide Id')
            .setDescription('*Please provide a backup Id.*')
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setColor(color)
            .setTimestamp();
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
            }
            if (!database[id]) {
                const embed = new Discord.EmbedBuilder()
                .setTitle('`❌` ▸ Invalid Id')
                .setDescription('*Please provide a valid backup Id.*')
                .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
                .setColor(color)
                .setTimestamp();
                return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
                }

                const embed = new Discord.EmbedBuilder()
                .setTitle('`🪄` ▸ Backup Load')
                .setDescription(`*You are going to load the following backup. Do you want to delete all current emojis ?\nBackup Id: \`${id}\`\nEmojis: \`${database[id].length}\`*`)
                .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
                .setColor(color)
                .setTimestamp();
        let components = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 3,
                        label: '✅',
                        custom_id: 'yes',
                    },
                    {
                        type: 2,
                        style: 4,
                        label: '❌',
                        custom_id: 'no',
                    },
                        {
                            type: 2,
                            style: 2,
                            label: 'Cancel',
                            custom_id: 'cancel',
                        }
                ]
            }
        ]
        const msg = await message.channel.send({ embeds: [embed], components });
        const response = await msg.awaitMessageComponent({
            filter: (i) => i.user.id === message.author.id
        });
        if (response.customId === 'cancel') msg.delete().catch(() => { });
        if (response.customId === 'yes') {
            const embed = new Discord.EmbedBuilder()
            .setTitle('`🪄` ▸ Deleting Emojis')
            .setDescription(`*Deleting emojis in progress...*`)
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setColor(color)
            .setTimestamp();
            msg.edit({ embeds: [embed], components: [] })
            await Promise.all(message.guild.emojis.cache.map((e) => e.delete()));
        }
        const embed2 = new Discord.EmbedBuilder()
        .setTitle('`🪄` ▸ Backup Load in progress')
        .setDescription(`*Creation of emojis in progress...*`)
        .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
        .setColor(color)
        .setTimestamp();
        msg.edit({ embeds: [embed2], components: [] })
        for await (const emoji of database[id]) {
            await message.guild.emojis.create({
                name: emoji.name,
                attachment: `https://cdn.discordapp.com/emojis/${emoji.url}`,
            });
        }
        const embed3 = new Discord.EmbedBuilder()
        .setTitle('`🪄` ▸ Backup loaded')
        .setDescription(`*Backup with id \`${id}\` loaded successfully.*`)
        .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
        .setColor(color)
        .setTimestamp();
        return msg.edit({ embeds: [embed3] })
    } else if (command === 'create') {
        if (!owners.includes(message.author.id)) {
            const embed = new Discord.EmbedBuilder()
            .setTitle('`❌` ▸ Unauthorized user')
            .setDescription('*You are not authorized to use this command.*')
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setColor(color)
            .setTimestamp();
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
            }
        let emojis = await message.guild.emojis.fetch();
        let backup = emojis.map((e) => {
            return {
                name: e.name,
                url: `${e.id}.${e.animated ? 'gif' : 'png'}`,
            }
        });
        let id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        database[id] = backup;
        writeDatabase();
        const embed = new Discord.EmbedBuilder()
        .setTitle('`🪄` ▸ Backup Created')
        .setDescription(`*Backup Id: \`${id}\`\nEmojis: \`${backup.length}\`*`)
        .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
        .setColor(color)
        .setTimestamp();
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    } else if (command === 'remove') {
        if (!owners.includes(message.author.id)) {
            const embed = new Discord.EmbedBuilder()
            .setTitle('`❌` ▸ Unauthorized user')
            .setDescription('*You are not authorized to use this command.*')
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setColor(color)
            .setTimestamp();
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
            }
        const id = args[0];
        if (!id) {
            const embed = new Discord.EmbedBuilder()
            .setTitle('`❌` ▸ Provide Id')
            .setDescription('*Please provide a backup Id.*')
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setColor(color)
            .setTimestamp();
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
            }
            if (!database[id]) {
                const embed = new Discord.EmbedBuilder()
                .setTitle('`❌` ▸ Invalid Id')
                .setDescription('*Please provide a valid backup Id.*')
                .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
                .setColor(color)
                .setTimestamp();
                return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
                }
        delete database[id];
        writeDatabase();
        const embed = new Discord.EmbedBuilder()
        .setTitle('`🪄` ▸ Backup Deleted')
        .setDescription(`*Backup with id \`${id}\` deleted successfully.*`)
        .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
        .setColor(color)
        .setTimestamp();
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    } else if (command === 'list') {
        if (!owners.includes(message.author.id)) {
            const embed = new Discord.EmbedBuilder()
            .setTitle('`❌` ▸ Unauthorized user')
            .setDescription('*You are not authorized to use this command.*')
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setColor(color)
            .setTimestamp();
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
            }

            const embed = new Discord.EmbedBuilder()
            .setTitle('`🪄` ▸ Backup List')
            .setDescription(Object.keys(database).length === 0 ? '\`None Backup\`' : Object.keys(database).map((e, index) => `*\`${index + 1}.)\` \`${e}\` — ${database[e].length} Emojis*`).join('\n'))
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setColor(color)
            .setTimestamp();
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    } else if (command === 'help') {
        const embed = new Discord.EmbedBuilder()
        .setTitle('`🪄` ▸ Help Menu')
        .setDescription(`*\`${prefix}help\` — Displays the help menu.\n\`${prefix}create\` — Create a backup of all server emojis.\n\`${prefix}remove\` — Deletes a backup.\n\`${prefix}load\` — Load a backup.\n\`${prefix}list\` — Displays the list of all backups.*`)
        .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
        .setColor(color)
        .setTimestamp();
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
})
process.on('unhandledRejection', (e) => console.error(e));
process.on('uncaughtException', (e) => console.error(e));