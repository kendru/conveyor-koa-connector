const { impl } = require('conveyor-client')
const crypto = require('crypto')

class EventBuffer {
    
    constructor() {
        this.events = []
        this.emitImpl = null
    }

    emit(event) {
        if (this.emitImpl) {
            this.emitImpl(event)
        } else {
            this.events.push(event)
        }
    }

    setEmitImpl(emitImpl) {
        this.emitImpl = emitImpl
        if (this.events.length > 0) {
            this.events.forEach(e => this.emitImpl(e))
            this.events = []
        }
    }
}

async function connect(koaApp, connectionOrClient, baseUrl) {
    const callbackEndpoint = `/${crypto.randomBytes(16).toString('hex')}`
    
    const buffer = new EventBuffer();
    koaApp.use(async function withConveyorSubscriptionWebhook(ctx, next) {
        if (ctx.path !== callbackEndpoint) {
            await next()
            return
        }
        
        if (ctx.method === 'GET') {
            const { challenge } = ctx.query
            ctx.body = challenge
            return
        } else if (ctx.method === 'POST' && typeof ctx.request.body === 'object') {
            buffer.emit(ctx.request.body)
            ctx.status = 200
        }
    })

    let connection
    if (connectionOrClient.getConnection) {
        connection = connectionOrClient.getConnection()
    } else {
        connection = connectionOrClient
    }
    
    let doCancel
    // Defer registration until the koa app is up and ready to respond to the webhook
    const oldCallback = koaApp.callback.bind(koaApp)
    koaApp.callback = function conveyorWrappedCallback() {
        impl.registerSubscriptionImpl(connection, function registerImplementation(emit, cancel) {
            buffer.setEmitImpl(emit)
            doCancel = cancel
            return baseUrl + callbackEndpoint
        })
        .catch((err) => console.error('Error subscribing to Conveyor events', err))
        
        return oldCallback()
    }

    return async function cancel() {
        if (doCancel) {
            await doCancel()
        }
    }
}

module.exports = connect