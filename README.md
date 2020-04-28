# rollup-plugin-fast-tsc

The official typescript plugin is painfully slow
at the time of writing. This plugin heavily inspired
by [this implementation in Proxx](https://github.com/GoogleChromeLabs/proxx/blob/e74c2ff1463985bc72aa152810acbc73c3f55c8d/lib/simple-ts.js)
and spawns a separate process for `tsc`.

The plugin is currently being livetested and should be
considered unstable.
