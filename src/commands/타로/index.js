const {SlashCommandBuilder, EmbedBuilder} = require('@discordjs/builders');
const fortune = require('../../static/fortune.json');
const imageSet = require('../../static/imageset.json');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

const callNickname = function (guild, user) {
    const member = guild.member;
    return member
        ? member.displayName
        : user.username;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('타로')
        .setDescription('타로점'),
    execute: async (interaction, botAvatarURL) => {
        // Show the modal to the user
        const {guild, user, channel} = interaction;

        const arcana = fortune['arcana'];
        const number = getRandomInt(0, 22);
        const heading = getRandomInt(0, 2) === 0
            ? true
            : false;
        const once = arcana[number];
        const nickname = callNickname(guild, user);

        const imageEmbed = new EmbedBuilder()
            .setImage(imageSet.arcana[
                heading
                    ? 'upward'
                    : 'downward'
            ][number])
            .setTitle('당신이 뽑은 카드는')
            .setAuthor({name: nickname, iconURL: user.avatarURL(), url: user.avatarURL()})
            .setDescription(
                `**${once.name}**. 방향은 **${heading
                    ? '정위치'
                    : '역위치'}**.`
            )
            .setTimestamp()
            .setFooter({text: '향란', iconURL: botAvatarURL});

        const fortuneEmbed = new EmbedBuilder()
            .setTitle(once.name)
            .setAuthor({name: nickname, iconURL: user.avatarURL(), url: user.avatarURL()})
            .addFields({
                name: '요약',
                value: once.summary
            }, {
                name: '정방향은',
                value: once.upward
            }, {
                name: '역방향은',
                value: once.downward
            }, {
                name: '\u200B',
                value: '\u200B'
            }, {
                name: '연애운',
                value: once.meanings[0]
            }, {
                name: '직업운',
                value: once.meanings[1]
            }, {
                name: '금전운',
                value: once.meanings[2]
            }, {
                name: '성격운',
                value: once.meanings[3]
            }, {
                name: '기타운',
                value: once.meanings[4]
            },)
            .setTimestamp()
            .setFooter({text: '향란', iconURL: botAvatarURL});

        await interaction.reply({
            embeds: [imageEmbed, fortuneEmbed]
        });
    }
};