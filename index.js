const Discord = require('discord.js');

const possible_words = require('./words.json');

// Unicode
const letterEmojisMap = {
    "🅰️": "A", "🇦": "A", "🅱️": "B", "🇧": "B", "🇨": "C", "🇩": "D", "🇪": "E",
    "🇫": "F", "🇬": "G", "🇭": "H", "ℹ️": "I", "🇮": "I", "🇯": "J", "🇰": "K", "🇱": "L",
    "Ⓜ️": "M", "🇲": "M", "🇳": "N", "🅾️": "O", "⭕": "O", "🇴": "O", "🅿️": "P",
    "🇵": "P", "🇶": "Q", "🇷": "R", "🇸": "S", "🇹": "T", "🇺": "U", "🇻": "V", "🇼": "W",
    "✖️": "X", "❎": "X", "❌": "X", "🇽": "X", "🇾": "Y", "💤": "Z", "🇿": "Z"
}

class HangmanGame {
    constructor(options) {
        this.gameEmbed = null;
        this.inGame = false;
        this.word = "";
        this.guesssed = [];
        this.wrongs = 0;
        this.this.options = this.options
    }

    newGame(msg) {
        if (this.inGame)
            return;

        this.inGame = true;
        this.word = possible_words[Math.floor(Math.random() * possible_words.length)].toUpperCase();
        this.guesssed = [];
        this.wrongs = 0;


        const embed = new Discord.MessageEmbed()
            .setColor(this.options.color ? this.options.color : 'RANDOM')
            .setTitle(this.options.title ? this.options.title : 'Hangman')
            .setDescription(this.getDescription())
            .addField('Letters Guessed', '\u200b')
            .addField("React to this message using the emojis that look like letters", "\u200b")
        
        if(this.options.timestamp) embed.setTimestamp()

        msg.channel.send(embed).then(emsg => {
            this.gameEmbed = emsg;
            this.waitForReaction();
        });
    }

    makeGuess(reaction) {
        if (Object.keys(letterEmojisMap).includes(reaction)) {
            const letter = letterEmojisMap[reaction];
            if (!this.guesssed.includes(letter)) {
                this.guesssed.push(letter);

                if (this.word.indexOf(letter) == -1) {
                    this.wrongs++;

                    if (this.wrongs == 6) {
                        this.gameOver(false);
                    }
                }
                else if (!this.word.split("").map(l => this.guesssed.includes(l) ? l : "_").includes("_")) {
                    this.gameOver(true);
                }
            }
        }

        if (this.inGame) {
            const editEmbed = new Discord.MessageEmbed()
                .setColor(this.options.color ? this.options.color : 'RANDOM')
                .setTitle(this.options.title ? this.options.title : 'Hangman')
                .setDescription(this.getDescription())
                .addField('Letters Guessed', this.guesssed.length == 0 ? '\u200b' : this.guesssed.join(" "))
                .addField("React to this message using the emojis that look like letters", "\u200b")
                .setTimestamp();
            this.gameEmbed.edit(editEmbed);
            this.waitForReaction();
        }
    }

    gameOver(win) {
        this.inGame = false;
        const editEmbed = new Discord.MessageEmbed()
            .setColor(this.options.color ? this.options.color : 'RANDOM')
            .setTitle(this.options.title ? this.options.title : 'Hangman')
            .setDescription((win ? "You Wins!" : "You losses") + "\n\nThe Word was:\n" + this.word)
            .setTimestamp();
        this.gameEmbed.edit(editEmbed);

        this.gameEmbed.reactions.removeAll();
    }

    getDescription() {
        return "```"
            + "|‾‾‾‾‾‾|   \n|     "
            + (this.wrongs > 0 ? "🎩" : " ")
            + "   \n|     "
            + (this.wrongs > 1 ? "😟" : " ")
            + "   \n|     "
            + (this.wrongs > 2 ? "👕" : " ")
            + "   \n|     "
            + (this.wrongs > 3 ? "🩳" : " ")
            + "   \n|    "
            + (this.wrongs > 4 ? "👞👞" : " ")
            + "   \n|     \n|__________\n\n"
            + this.word.split("").map(l => this.guesssed.includes(l) ? l : "_").join(" ")
            + "```";
    }

    waitForReaction() {
        this.gameEmbed.awaitReactions(() => true, { max: 1, time: 300000, errors: ['time'] })
            .then(collected => {
                const reaction = collected.first();
                this.makeGuess(reaction.emoji.name);
                reaction.remove();
            })
            .catch(collected => {
                this.gameOver(false);
            });
    }
}

module.exports = HangmanGame;
