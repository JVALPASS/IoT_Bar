const { Telegraf } = require('telegraf')
const moment = require('moment')
require('dotenv').config()
var mqtt = require('mqtt')
const options = {
    host: 'mqtt://' + process.env.MY_IP,
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: 'guest',
    password: 'guest',
}
const client = mqtt.connect('mqtt://' + process.env.MY_IP, options)
var topicTemp = 'iot/logs/temp';
var topicAlertTemp = 'iot/alerts/temp';
var topicHandle = 'iot/logs/handle';
var topicCO = 'iot/logs/CO';
var topicAlertCO = 'iot/alerts/CO';
const bot = new Telegraf(`${process.env.BOT_TOKEN}`)
var chatId
var temp_msg = 22
var CO_msg = 9
// * Client riceve un messaggio dalla coda
subscribe(topicAlertTemp);
subscribe(topicAlertCO);
//connectAndWait()
// * Start del bot
bot.start((ctx) => {
  chatId = ctx.update.message.chat.id
  ctx
    .reply(`🤖 Hi ${ctx.update.message.chat.first_name}! Nice to meet you!\n\nI’ll warn you when the temperature of your bar will be not in 16-25C°, or when the CO will be higher than 25ppm⚠️`)
    .then(() => {
      ctx.reply(`⚠️ Don't stop this bot if you want to keep track of your parameters in the bar.\n`)
    })
})

// * Callback function
bot.action('remote_temp', (ctx) => {
  publish(topicTemp.toString(), temp_msg.toString(),{ qos: 2, retain: false });
  publish(topicHandle.toString(), 'false',{ qos: 0, retain: false });
  ctx.deleteMessage()
  var str = '🤖 Don’t worry: I’ll decrease temperature.\n\nDate: ' + moment().format('MMMM Do YYYY, h:mm:ss a')

  ctx.reply(str)
})

// * Callback function
bot.action('call_someone_temp', (ctx) => {
  publish(topicHandle.toString(), 'true',{ qos: 0, retain: false });
  ctx.deleteMessage()
  var str = "💁🏻‍♂️ Don't worry: I warned someone to enable air-conditioner.\n\nDate: " + moment().format('MMMM Do YYYY, h:mm:ss a')

  ctx.reply(str)
})

bot.launch()

// * Aspetto connessioni
function subscribe(topic) {
    if (!client.connected) {
        client.on('connect', function() {
            console.log(" [x] connected " + client.connected);
            client.subscribe(topic, function(err) {
                if (!err) {
                    console.log(" [x] subscripted " + topic);
                }
            })
        })
    } else {
        client.subscribe(topic, function(err) {
            if (!err) {
                console.log(" [x] subscripted " + topic);
            }
        })
    }
}
client.on('message', function(topic, message) {
    // message is Buffer
    console.log(" [x] %s:'%s'", topic, message.toString());
    if (topic.toString() == 'iot/alerts/temp')
    	waitForMessageTemp(message);
    else if (topic.toString() == 'iot/alerts/CO')
    	waitForMessageCO(message);
})

// * Aspetto messaggi
function waitForMessageTemp(msg) {
  console.log('Temperature: ' + msg.toString());
  // * Opzioni per callback
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Put the temperature in the range 16-25C°',
            callback_data: 'remote_temp',
          },
        ],
        [
          {
            text: 'Warn employee to enable air-conditioner',
            callback_data: 'call_someone_temp',
          },
        ],
      ],
    },
  }

  // Messaggio al bot
  bot.telegram.sendMessage(
    chatId,
    `Hey! The Temperature of the bar is not good, is at ${msg.toString()}C°! 🏜\nWhat do you want to do?`,
    options
  )
}
function waitForMessageCO(msg) {
  console.log('CO: ' + msg.toString());
  publish(topicCO.toString(), CO_msg.toString(),{ qos: 2, retain: false });
  // Messaggio al bot
  bot.telegram.sendMessage(
    chatId,
    `Hey! The CO of the bar is not good, is at ${msg.toString()}ppm!⚠️\n. Don't worry i will decrease it`
  )
}


// * Loggo i messaggi di risposta
function publish(topic, msg, options) {
    if (!client.connected) {
        client.on('connect', function() {
            console.log(" [x] connected " + client.connected);
            client.publish(topic, msg, options, function() {
                console.log(" [x] Sent %s:'%s'", topic, msg);
            })
        })
    } else {
        client.publish(topic, msg, options, function() {
            console.log(" [x] Sent %s:'%s'", topic, msg);
        })
    }
}
