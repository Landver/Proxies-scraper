const puppeteer = require('puppeteer');
const fs = require('fs');

let browser;
let page;

/** list of methods to scrape site free-proxy.cz */
const freeProxy = {
    /** initialization */
    initialize: async () => {
        console.log('Starting the scraper..');

        browser = await puppeteer.launch({ headless: false });
        page = await browser.newPage();
    },

    /** move page by page, scraping list of proxies */
    getProxies: async () => {
        console.log(`Collect proxies from the table..`);

        /** selectors */
        const paginator ='div[class="paginator"]'

        /** pass the pages, collect and save proxies into file */
        let pageNumber = 1;
        while (pageNumber <= 150) {

            await page.goto(`http://free-proxy.cz/en/proxylist/main/${pageNumber}`);

            /** Confirm that site had been loaded by checking if paginator had loaded.
             * And if not, then trigger some actions. */
            try { await page.waitFor(paginator, { timeout: 300000 }) }
            catch (err) { console.log(err) };

            let proxies = await page.evaluate(() => {
                const listOfProxies = [];
                const rows = document.querySelectorAll('#proxy_list > tbody > tr');
    
                debugger;
                for (const row of rows) {
                    if (row.children.length === 11) {  // check that line contain of proxy details and is not advertisment
                        const address =     row.children[0].innerText;
                        const port =        row.children[1].innerText;
                        const protocol =    row.children[2].innerText;
                        const country =     row.children[3].innerText;
                        const region =      row.children[4].innerText;
                        const city =        row.children[5].innerText;
                        const anonymity =   row.children[6].innerText;
                        const speed =       row.children[7].innerText;
                        const uptime =      row.children[8].innerText;
                        const responce =    row.children[9].innerText;
                        const lastCheck =   row.children[10].innerText;
                        
                        listOfProxies.push({
                            address, port, protocol,
                            country, region, city,
                            anonymity, speed, uptime,
                            responce, lastCheck
                        })
                    }
                };
    
                return listOfProxies;
            });
    
            let jsonData = []
            try { jsonData = JSON.parse(fs.readFileSync('./media/proxies_free-proxy.json', 'utf-8')) } // read file with saved proxies
            catch (err) { fs.writeFileSync('./media/proxies_free-proxy.json', JSON.stringify(jsonData)) } // create new file if there the one doesn't exist
    
            let newJsonData = [...jsonData, proxies];
            fs.writeFileSync('./media/proxies_free-proxy.json', JSON.stringify(newJsonData)); // write updated proxy list into file

            pageNumber += 1;
            setTimeout(() => {}, 10000);
        }
    },

    /** close the browser */
    end: async () => { await browser.close() }
};

module.exports = freeProxy;
