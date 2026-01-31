'use strict'
require('dotenv').config()
const amqp = require('amqplib')

const connectToRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URI)
        if(!connection) throw new Error(' Connection not established')

        const channel = await connection.createChannel()

        return {channel, connection}
    } catch (error) {
        console.error('Error connecting to RabbitMQ', error);
    }
}

const connectToRabbitMQForTest = async () => {
    try {
        const {channel, connection } = await connectToRabbitMQ()

        // publish message to a queue
        const queue = 'test-queue'
        const message = 'Hello'
        await channel.assertQueue(queue)
        await channel.sendToQueue(queue, Buffer.from(message))

        // close the connection
        await connection.close()
    } catch (error) {
        console.log(`Eroor connecting to RabbitMQ`, error);
        throw error
    }
}

module.exports = {
    connectToRabbitMQ,
    connectToRabbitMQForTest
}