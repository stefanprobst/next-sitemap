declare module 'xast-util-to-xml' {
  import { Node } from 'xast'

  interface Options {
    /**
     * Preferred quote to use.
     * Default: '"'
     */
    quote?: '"' | "'"
    /**
     * Use the other quote if that results in less bytes.
     * Default: false
     */
    quoteSmart?: boolean
    /**
     * Close elements without any content with slash (/) on the opening tag
     * instead of an end tag: `<circle />` instead of `<circle></circle>`.
     * See `tightClose` to control whether a space is used before the slash.
     * Default: false
     */
    closeEmptyElements?: boolean
    /**
     * Do not use an extra space when closing self-closing elements:
     * `<circle/>` instead of `<circle />`.
     * Default: false
     */
    tightClose?: boolean
    /**
     * Allow `raw` nodes and insert them as raw XML. When falsey, encodes `raw` nodes.
     * Only set this if you completely trust the content!
     * Default: false
     */
    allowDangerousXml?: boolean
  }

  /**
   * Serialize the given xast tree.
   */
  declare function toXml(tree: Node, options?: Options): string

  export = toXml
}
