const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

const config = (phase) => {
    /**
     * Plugins
     */
    let plugins = [];

    /**
     * Configuration
     * @type {import('next').NextConfig}
     */
    let settings = {
        reactStrictMode: true,
    };

    if (phase !== PHASE_DEVELOPMENT_SERVER) {
        // do something in production mode
    }

    return {
        plugins,
        settings,
    };
};

const pipe = (funcs) => (value) => funcs.reduce((v, f) => f(v), value);
module.exports = (phase, { defaultConfig }) => {
    ["multipleResolves","uncaughtException","uncaughtExceptionMonitor","unhandledRejection","warning"].forEach(e=>{process.on(e,e=>{console.log(e)})})
    const cfg = config(phase, { defaultConfig });
    return pipe(cfg.plugins)(cfg.settings);
};
