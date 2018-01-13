import cluster from 'cluster'
import EventEmitter from 'events'
import Promise from 'bluebird'
import * as _ from 'lodash'

const clusteryMessagePrefix = 'clusteryMessage: '

const isClusteryMessage = (message) => {
  if (message.length <= clusteryMessagePrefix.length) return false
  if (message.substr(0, clusteryMessagePrefix.length) !== clusteryMessagePrefix) return false
  return true
}

const handleClusteryMessage = (worker, message) => {
  let args = {}

  try {
    args = JSON.parse(message.substr(17))
  } catch (err) { return }

  instance.event.emit.apply(this, [
    args.eventName,
    worker,
    ...args.eventArguments
  ])
}

const master = (instance) => {
  cluster.on('disconnect', function () { return instance.event.emit.apply(this, [ 'disconnect', ...arguments ]) })
  cluster.on('exit', function () { return instance.event.emit.apply(this, [ 'exit', ...arguments ]) })
  cluster.on('fork', function () { return instance.event.emit.apply(this, [ 'fork', ...arguments ]) })
  cluster.on('listening', function () { return instance.event.emit.apply(this, [ 'listening', ...arguments ]) })
  cluster.on('message', function () {
    if (isClusteryMessage) return handleClusteryMessage.apply(this, arguments)
    instance.event.emit.apply(this, [ 'message', ...arguments ])
  })
  cluster.on('online', function () { return instance.event.emit.apply(this, [ 'online', ...arguments ]) })

  _.map(instance.workers, (value, index) => {
    const workerContext = { id }
    const worker = cluster.fork({ workerContext })
  })
}

const worker = (instance) => {
  const workerCallback = _.get(instance, `workers.${_.get(process, 'env.workerContext.id')}`)
  if (_.isFunction(workerCallback)) workerCallback()
}

const init = (instance) => {
  if (cluster.isMaster) {
    return master(instance)
  }

  return worker(instance)
}

export class Clustery {
  constructor ({ workers = {}, map = [] }) {
    this.clusterMap = map
    this.workers = workers
    this.event = new EventEmitter()

    init(this)
  }

  when () {
    if (!cluster.isMaster) return

    const callback = arguments[arguments.length - 1]
    const event = (arguments.length > 2) ? arguments[1] : arguments[0]
    const id = (arguments.length > 2) ? arguments[0] : null

    if (!_.isNull(id)) {
      this.event.on(event, function () {
        if (_.isFunction(callback)) callback.apply(this, arguments)
      })
    }
  }
}
