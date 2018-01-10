# Conveyor Koa Connector

Connector for [conveyor-client](https://github.com/kendru/conveyor-client)
to enable WebHook subscriptions using the koa web framework.

### Usage

```
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const conveyor = require('conveyor-client');
const connect = require('./connector');

const app = new Koa();
const c = conveyor.Client('localhost', 3000, false);
app.use(bodyParser());

connect(app, c.getConnection(), 'http://localhost:3300')
    .then(() => app.listen(8080))

```