const spys = require('./spys');

(async () => {
    await spys.initialize();
    const urlsAndCountries = await spys.getURLsAndCountries();
    await spys.getProxies(urlsAndCountries);
    await spys.end();
})();