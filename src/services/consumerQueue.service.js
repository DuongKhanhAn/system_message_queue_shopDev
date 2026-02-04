'use strict'

const {
    consumerQueue,
    connectToRabbitMQ
} = require('../dbs/init.rabbit')

// const log = console.log

// console.log = function(){
//     log.apply(console, [new Date()].concat(arguments))
// }

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
            
            // 1. TTL
            // const timeExpried = 5000
            // setTimeout( () => {
            //     channel.consume(notiQueue, msg => {
            //         console.log(`SEND notificationQue successfully processed:`, msg.content.toString())
            //         channel.ack(msg)
            //     })
            // }, timeExpried)

            // 2. Logic
            channel.consume(notiQueue, msg => {
                try {
                    const numberTest = Math.random()
                    console.log({numberTest})
                    if(numberTest < 0.8 ){
                        throw new Error('Send notification failed:: HOT FIX')
                    }

                    console.log(`SEND notification successfully processed:`, msg.content.toString())
                    channel.ack(msg)
                } catch (error) {
                    // console.error('SEND notification error', error);
                    channel.nack(msg, false, false)
                    /*
                        - nack: negative acknowledgement
                        - Khi bi loi se nem du lieu msg vao queue loi (notiQueueHandle)
                        - msg: doi tuong tin nhan nhận được từ hàng đợi trước cần đẩy vào hàng đợi xử lý lỗi
                        - false: chỉ định có nên sắp xếp lại msg không(true: có, đẩy ngược lại / false: không, đẩy xuống dưới notiQueueHandle)
                        - false: có muốn từ chối nhiều tin không (true: có / false: chỉ từ chối msg hiện tại)
                    */
                }
            })
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