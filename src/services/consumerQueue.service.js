'use strict'

const {
    consumerQueue,
    connectToRabbitMQ
} = require('../dbs/init.rabbit')

const log = console.log

console.log = function(){
    log.apply(console, [new Date()].concat(arguments))
}

const messageService = {
    consumerToQueue: async (queueName) => {
        try {
            const { channel, connection } = await connectToRabbitMQ()
            await consumerQueue(channel, queueName)
        } catch (error) {
            console.error(`Error consumerToQueue::`, error)
        }
    },

    // case processing
    consumerToQueueNormal: async (queueName) => {
        try {
            const { channel, connection } = await connectToRabbitMQ()
            const notiQueue = 'notificationQueueProcess' // assertQueue
            
            const timeExpried = 15000
            setTimeout( () => {
                channel.consume(notiQueue, msg => {
                    console.log(`SEND notificationQue successfully processed:`, msg.content.toString())
                    channel.ack(msg)
                })
            }, timeExpried)

        } catch (error) {
            console.error(error);
        }
    },
    
    // case failed processing
    consumerToQueueFailed: async (queueName) => {
        try {
            const { channel, connection } = await connectToRabbitMQ()

            const notificationExchangeDLX ='notificationExDLX'
            const notificationRoutingKeyDLX ='notificationRoutingKeyDLX' // assert
            const notiQueueHandle = 'notificationQueueHotFix'

            await channel.assertExchange(notificationExchangeDLX, 'direct', {
                durable: true
            })

            const queueResult = await channel.assertQueue(notiQueueHandle, {
                exclusive: false
            })

            await channel.bindQueue( queueResult.queue, notificationExchangeDLX, notificationRoutingKeyDLX)
            await channel.consume( queueResult.queue, msgFailed => {
                console.log(`This notification error:, pls hot fit::`, msgFailed.content.toString());
            }, {
                noAck: true
            })
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = messageService