import { MetadataStorage } from "@nedusa/deps/mikro-orm/core"

export function ForeignKey() {
  return function (target, propertyName) {
    const meta = MetadataStorage.getMetadataFromDecorator(target.constructor)
    const prop = meta.properties[propertyName] || {}
    prop["isForeignKey"] = true
    meta.properties[prop.name] = prop
  }
}
