import Telegram from 'node-telegram-bot-api'
import sequelize from './db.js'
import User from './UserModel.js'





const token = '7942830640:AAGmV76U9xjSLdzc8tMwooqABy9lbSdI-e4'


const bot = new Telegram( token, { polling: true } )
const chats = []

try {
    await sequelize.authenticate();
    await sequelize.sync() // синхронизириуем модели с таблицами в БД
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

bot.setMyCommands([
    { command: '/start', description: "Greetings" },
    { command: '/info', description: "Get Info" },
    { command: '/game', description: "Start game" },
])

const gameOptionsMenu = {
    reply_markup: {
        inline_keyboard: [
            [ { text: '1', callback_data: 1 }, { text: '2', callback_data: 2 }, { text: '3', callback_data: 3 }, ],
            [ { text: '4', callback_data: 4 }, { text: '5', callback_data: 5 }, { text: '6', callback_data: 6 }, ],
            [ { text: '7', callback_data: 7 }, { text: '8', callback_data: 8 }, { text: '9', callback_data: 9 }, ],
            [ { text: '0', callback_data: 0 } ]
        ]
    }
}

bot.on( 'message', async msg => {
    const chatId = msg.chat.id
    const text = msg.text

    if( text === '/start' )
    {
        const user = await User.findOrCreate({
            where: { chatId: chatId.toString() }
        });
        await bot.sendSticker( chatId, 'https://ih1.redbubble.net/image.441582952.6843/st,small,507x507-pad,600x600,f8f8f8.u3.jpg' )
        await bot.sendMessage( chatId, "Greetings" )
        return
    }
    if( text === '/info' )
    {
        console.log( typeof chatId )
        const user = await User.findOne({ chatId });
        // console.log( user )
        await bot.sendMessage( chatId, `You are ${msg.chat.first_name} ${msg.chat.last_name}. 
        Lost: ${user.wrongAnswer}. Won: ${user.rightAnswer}`)
        return
    }
    if( text === '/game' )
    {
        chats[ chatId ] = Math.floor( Math.random() * 10 )
        console.log( chats[ chatId ] )
        // console.log( typeof chats[ chatId ] )
        await bot.sendMessage( chatId, 'Guess number from 0 to 9', gameOptionsMenu)
        return
    }

    await bot.sendMessage( chatId, "I dont understand you" )

})

bot.on( 'callback_query', async msg => {
    // console.log( msg )
    const chatId = msg.message.chat.id
    const data = parseInt( msg.data, 10 )
    // console.log( typeof data )
    const user = await User.findOne({ chatId });

    if( data === chats[ chatId ] )
    {

        user.rightAnswer++
        user.save()
        await bot.sendMessage( chatId, 'You are won' )
        return
    }

    user.wrongAnswer++
    user.save()
    await bot.sendMessage( chatId, 'You are lost' )
})