import cluster from 'cluster'
import EventEmitter from 'eventemitter3'
import Promise from 'bluebird'
import * as _ from 'lodash'

const getContext = () => {
  if (cluster.isMaster) {
    return {
      processType: 'master'
    }
  }

  return {
    processType: 'worker',
    workerId: process.env.CLUSTERY_WORKER_ID
  }
}

const master = (instance) => {
  _.map(instance.clusterMap, (id, index) => {
    const worker = cluster.fork({ CLUSTERY_WORKER_ID: id })
  })
}

const init = (instance) => {
  if (cluster.isMaster) master(instance)
}

export class Clustery {
  constructor (map, options) {
    this.clusterMap = map
    this.context = getContext()
    this.options = {
      prefix: 'clusteryMessage: ',
      identifierDelimiter: ':',
      ...options
    }

    // Makes sure we can safely register all our events before we start
    // our cluster
    process.nextTick(() => init(this))
  }

  whichWorker () {
    if (cluster.isMaster) return
    const context = getContext()
    if (_.isNil(context.workerId)) return
    return context.workerId
  }

  is (processType, workerId) {
    const context = getContext()
    if (context.processType !== processType.toLowerCase()) { return false }
    if (!_.isNil(workerId) && context.workerId !== workerId) { return false }
    return true
  }

  which () { return this.whichWorker() }
}
