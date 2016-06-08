module.exports = {
    entry: {
        isotope: './app/views/components/panelGrid/js/panelGrid.js',
        jasmineUnitTest: './test/unit/SpecRunner.js'
    },
    output: {
        path: 'public/js/common/bundles',
        filename: '[name]_bundle.js'
    },
    module: {
        loaders: [
            {
                test: /isotope-layout/,
                loader: 'imports?define=>false&this=>window'
            },
            {
                test: /\.js/,
                loader: 'babel',
                include: __dirname + '/src'
            },
            {
                test: /\.scss/,
                loaders: ['style', 'css', 'sass'],
            }
        ]
    }
};