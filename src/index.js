const conveyor = require('conveyor-client')
const crypto = require('crypto')

async function connect(koaApp, conn, baseUrl) {
    const callbackEndpoint = `/${crypto.randomBytes(16).toString('hex')}`

    await conveyor.registerSubscriptionImpl(conn, function registerImplementation(emit, cancel) {
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