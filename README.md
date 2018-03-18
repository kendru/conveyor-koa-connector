# Conveyor Koa Connector

Connector for [conveyor-client](https://github.com/kendru/conveyor-client)
to enable WebHook subscriptions using the koa web framework.

This connector sets up a randomly generated endpoint and performs a
challenge-response handshake with the Conveyor server once Koa has
started up an HTTP server and is ready to accept connections.

### Usage

```
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const conveyor = require('conveyor-client');
const connect = require('conveyor-koa-connector');

(async function initialize() {
    const app = new Koa();
    const c = conveyor.Client('localhost', 3000, false);
    app.use(bodyParser());

    await connect(app, c.getConnection(), 'http://localhost:8080');

    app.listen(8080, () => {
        console.log('Connected to Conveyor for subscriptions.');
    });
})();
```
