const SnapshotController = require('./libs/SnapshotController')

const Koa = require('koa')

const controller = new SnapshotController()

const app = new Koa()

app.use(async ctx => {
  return await controller.postSnapshotJson(ctx)
})
app.listen(3000);