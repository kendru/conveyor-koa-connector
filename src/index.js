const { impl } = require('conveyor-client')
const crypto = require('crypto')

async function connect(koaApp, connectionOrClient, baseUrl) {
    const callbackEndpoint = `/${crypto.randomBytes(16).toString('hex')}`
    let connection
    if (connectionOrClient.getConnection) {
        connection = connectionOrClient.getConnection()
    } else {
        connection = connectionOrClient
    }

    await impl.registerSubscriptionImpl(connection, function registerImplementation(emit, cancel) {
        koaApp.use(async function (ctx, next) {
            if (ctx.path !== callbackEndpoint) {
                await next()
                return
            }
            
            if (ctx.method === 'GET') {
                const { challenge } = ctx.query
                ctx.body = challenge
                return
            } else if (ctx.method === 'POST' && typeof ctx.request.body === 'object') {
                emit(ctx.request.body)
                ctx.status = 200
            }
        })

        return baseUrl + callbackEndpoint
    })
}

module.exports = connect