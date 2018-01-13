# Clustery
#### A node cluster manager

### How to use

```javascript
const cluster = new Clustery({
  map: ['app', 'cache']
  workers: {
    app: context => {}
    cache: context => require()
  }
})

cluster.when('master', 'init', context => {})
cluster.when('worker', 'init', context => {})
cluster.when('worker:app', 'init', context => {})
```
