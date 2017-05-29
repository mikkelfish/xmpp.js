'use strict'

const xml = require('@xmpp/xml')
const iqCaller = require('../iq-caller')

const NS = 'vcard-temp'

const parse = el => {
  const dict = {}
  el.children.forEach(c => {
    if (c.children && typeof c.children[0] === 'string') {
      dict[c.name] = c.text()
    } else {
      dict[c.name] = parse(c)
    }
  })
  return dict
}

const build = (dict, parent) => {
  const builder = parent || xml`<vCard xmlns='${NS}' version='2.0'/>`
  for (const key of Object.keys(dict)) {
    const val = dict[key]
    if (typeof val === 'object') {
      builder.cnode(build(val, xml`<${key}/>`)).up()
    } else if (val) {
      builder.c(key).t(val)
    } else {
      builder.c(key).up()
    }
  }
  return builder
}

function plugin(entity) {
  const caller = entity.plugin(iqCaller)

  return {
    entity,
    get(...args) {
      return caller.get(xml`<vCard xmlns='${NS}'/>`, ...args).then(parse)
    },
    set(vcard) {
      return caller.set(build(vcard))
    },
  }
}

module.exports = {
  name: 'vcard',
  NS,
  build,
  parse,
  plugin,
}