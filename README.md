# Clustery
#### A node cluster manager

### Introduction

The goal of clustery is to make the whole process of building a project or application using a cluster less confusing and easier.

Clustery will do 2 things for you:
1. Create a cluster given a array of worker id
2. Exposes process events through a simplier api

### How to use

```javascript
const cluster = new Clustery([ 'app', 'cache' ])

switch (cluster.which()) {
  case 'app': require('./workers/app'); break
  case 'cache': require('./workers/cache'); break
}
```
