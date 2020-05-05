const { CardFactory } = require('botbuilder');
const { ConnectorClient, MicrosoftAppCredentials } = require('botframework-connector');
const { createHmac } = require('crypto');
const striptags = require('striptags');

const VR_OPERATORS_CHANNEL_ID = '19:44121d6ec687487e9ed236bf396e2c91@thread.skype';
const VEHICLE_MOVEMENTS_CHANNEL_ID = '19:80185faa397f47c9a35095b40de3bc7a@thread.skype';

export default async (req, res) => {
  // Make sure we have a POST reqest.
  if (req.method.toUpperCase() !== 'POST') {
    res.status(400).end();
    return;
  }

  // TODO authenticate message

  const activity = req.body;

  // Make sure it's coming from the vehicle movements channel.
  if (activity.channelData.teamsChannelId != VEHICLE_MOVEMENTS_CHANNEL_ID) {
    res.status(200).end();
    return;
  }

  // Make a new post in the VR operators channel.
  MicrosoftAppCredentials.trustServiceUrl(process.env.BOT_SERVICE_URL);

  const credentials = new MicrosoftAppCredentials(process.env.BOT_APP_ID, process.env.BOT_APP_PASSWORD);
  const connector = new ConnectorClient(credentials, { baseUri: process.env.BOT_SERVICE_URL });

  const card = CardFactory.adaptiveCard({
    "type": "AdaptiveCard",
    "version": "1.0",
    "body": [
      {
        "type": "ColumnSet",
        "columns": [
          {
            "type": "Column",
            "width": "auto",
            "items": [
              {
                "type": "Image",
                "altText": "",
                "width": "32px",
                "url": "https://nic-bot.now.sh/images/vehicle.png",
                "height": "32px"
              }
            ]
          },
          {
            "type": "Column",
            "width": "stretch",
            "items": [
              {
                "type": "TextBlock",
                "text": "VR Vehicle Movement",
                "weight": "Bolder",
                "size": "Medium"
              }
            ],
            "verticalContentAlignment": "Center"
          }
        ]
      },
      {
        "type": "TextBlock",
        "text": `${activity.from.name}: ${striptags(activity.text)}`
      }
    ],
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json"
  });

  await connector.conversations.createConversation({
    isGroup: true,
    channelData: { channel: { id: VR_OPERATORS_CHANNEL_ID } },
    activity: { type: 'message', attachments: [card] },
  });

  res.status(200).json({
    type: 'message',
    text: 'Thanks, I\'ll post this to the VR Operators channel.',
  });
}
