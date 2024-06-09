const l = require('./node_modules/aws-cdk/lib');
l.cli();

if ('GRAPHVIZ_LOC' in process.env) {
    throw new Error(`GraphViz: ${process.env.GRAPHVIZ_LOC}`);
}