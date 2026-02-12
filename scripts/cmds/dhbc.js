const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
	config: {
		name: "dhbc",
		version: "2.0",
		author: "NTKhang FIXED BY SHOUROV",
		countDown: 5,
		role: 0,
		description: {
			en: "Play game catch the word"
		},
		category: "game",
		guide: {
			en: "{pn}"
		},
		envConfig: {
			reward: 1000
		}
	},

	langs: {
		en: {
			reply: "Reply this message with the correct answer:\n%1",
			isSong: "\n🎵 This is a song by: %1",
			notPlayer: "⚠ You are not the player of this question.",
			correct: "🎉 Correct! You received %1$",
			wrong: "❌ Wrong answer!",
			apiError: "❌ Game server error. Try again later.",
			noAnswer: "⚠ Please enter an answer."
		}
	},

	// ================== START GAME ==================
	onStart: async function ({ message, event, commandName, getLang }) {
		try {
			const res = await axios.get(
				"https://goatbotserver.onrender.com/api/duoihinhbatchu",
				{ timeout: 15000 }
			);

			if (!res.data || !res.data.data)
				return message.reply(getLang("apiError"));

			const { wordcomplete, casi, image1, image2 } = res.data.data;

			if (!wordcomplete)
				return message.reply(getLang("apiError"));

			const maskedWord = wordcomplete.replace(/\S/g, "█ ");

			const attachments = [];

			if (image1) attachments.push(await getStreamFromURL(image1));
			if (image2) attachments.push(await getStreamFromURL(image2));

			message.reply(
				{
					body:
						getLang("reply", maskedWord) +
						(casi ? getLang("isSong", casi) : ""),
					attachment: attachments
				},
				(err, info) => {
					if (!info) return;

					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						author: event.senderID,
						wordcomplete
					});
				}
			);
		} catch (err) {
			console.log("DHBC ERROR:", err.message);
			return message.reply(getLang("apiError"));
		}
	},

	// ================== HANDLE REPLY ==================
	onReply: async function ({
		message,
		Reply,
		event,
		getLang,
		usersData,
		envCommands,
		commandName
	}) {
		const { author, wordcomplete, messageID } = Reply;

		if (event.senderID != author)
			return message.reply(getLang("notPlayer"));

		if (!event.body)
			return message.reply(getLang("noAnswer"));

		if (formatText(event.body) === formatText(wordcomplete)) {
			global.GoatBot.onReply.delete(messageID);

			const reward =
				envCommands?.[commandName]?.reward || 1000;

			await usersData.addMoney(event.senderID, reward);

			return message.reply(getLang("correct", reward));
		} else {
			return message.reply(getLang("wrong"));
		}
	}
};

// ================== TEXT FORMAT ==================
function formatText(text) {
	return text
		.normalize("NFD")
		.toLowerCase()
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[đ|Đ]/g, (x) => (x === "đ" ? "d" : "D"))
		.trim();
}