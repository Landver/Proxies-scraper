const spys = require('./spys');
const freeProxy = require('./free-proxy');

(async () => {
    // scrape spys.one
    await spys.initialize();
    const urlsAndCountries = await spys.getURLsAndCountries();
    await spys.getProxies(urlsAndCountries);
    await spys.end();

    // scrapy free-proxy.cz
    await freeProxy.initialize();
    await freeProxy.getProxies();
    await freeProxy.end();    
})();