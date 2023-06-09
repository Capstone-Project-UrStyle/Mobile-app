module.exports = function (api) {
    api.cache(true)
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./'],
                    alias: {
                        api: './api',
                        assets: './assets',
                        components: './components',
                        constants: './constants',
                        contexts: './contexts',
                        hooks: './hooks',
                        navigation: './navigation',
                        screens: './screens',
                    },
                    extensions: ['.tsx', '.ts', '.js', '.json'],
                },
            ],
            'react-native-reanimated/plugin',
        ],
    }
}
