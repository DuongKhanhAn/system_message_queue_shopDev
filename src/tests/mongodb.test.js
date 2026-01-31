'use strict'

const mongoose = require('mongoose')

const connecString = 'mongodb://localhost:27017/shopDEV'

const TestSchema = new mongoose.Schema({ name: String })
const Test = mongoose.model('Test', TestSchema)

describe('Mongoose Connection', () => {
    let connection;

    beforeAll(async() => {
        connection = await mongoose.connect(connecString)
    })

    // Close the connection to mongoose
    afterAll( async() => {
        await connection.disconnect();
    })

    it('Should connect to mongoose', () => {
        expect(mongoose.connection.readyState).toBe(1)
    })

    it('Should save a document to the database', async() => {
        const user = new Test({name: 'An'})
        await user.save()
        expect(user.isNew).toBe(false)
    })

    it('Should fimd a document to the database', async() => {
        const user = await Test.findOne({name: 'An'})
        expect(user).toBeDefined()
        expect(user.name).toBe('An')
    })
})