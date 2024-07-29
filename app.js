require('dotenv').config();
const { App } = require('@slack/bolt');
const axios = require('axios');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.message(async ({ message, say }) => {
  if (message.subtype && message.subtype === 'bot_message') {
    return;
  }

  const userQuestion = message.text;

  try {
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/engines/davinci-codex/completions',
      {
        prompt: userQuestion,
        max_tokens: 150,
        temperature: 0.5,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const botResponse = openaiResponse.data.choices[0].text.trim();
    await say(`Here is what I found:\n${botResponse}`);
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    await say('Sorry, I had trouble finding an answer. Please try again later.');
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Slack Bolt app is running!');
})();
