# Conveyor Koa Connector

Connector for [conveyor-client](https://github.com/kendru/conveyor-client)
to enable WebHook subscriptions using the koa web framework.

### Usage

```
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const conveyor = require('conveyor-client');
const connect = require('conveyor-koa-connector');

const app = new Koa();
const c = conveyor.Client('localhost', 3000, false);
app.use(bodyParser());

app.listen(8080, async () => {
    // The application should not be connected until after it is ready to
    // receive connections, since conveyor will immediately issue a WebHook
    // challenge before accepting subscriptions.
    await connect(app, c.getConnection(), 'http://localhost:8080');
    console.log('Connected to Conveyor for subscriptions.');
});
```
