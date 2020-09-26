import 'prettier'

declare module 'prettier' {
  interface Options {
    parser: BuiltInParserName | CustomParser | 'xml'
    /** Adds a space before self-closing tags. */
    xmlSelfClosingSpace?: boolean
    /** How to handle whitespaces. */
    xmlWhitespaceSensitivity?: 'strict' | 'ignore'
  }
}
