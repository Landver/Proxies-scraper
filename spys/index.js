const puppeteer = require('puppeteer');
const fs = require('fs');

let browser;
let page;

/** list of methods to scrape site spys.one */
const spys = {
    /** initialization */
    initialize: async () => {
        console.log('Starting the scraper..');

        browser = await puppeteer.launch({ headless: false });
        page = await browser.newPage();
    },

    /** collect URLs to countries lists of proxies */
    getURLsAndCountries: async () => {
        console.log('Getting list of countries URLs..');

        await page.goto('http://spys.one/en/proxy-by-country/'); // list by countries

        const urls = await page.evaluate(() => {
            /** create array of URLs */
            const output = [];
            const rows = document.querySelectorAll('tr:nth-child(5) > td > table > tbody > tr > td > table > tbody > tr.spy1x  a');
            for (const a of rows) {
                output.push({ url: a.pathname, country: a.children[0].innerText })
            };

            return output;
        })
        return urls;
    },

    /** according to list of countries, parse each country and retrieve it's proxies */
    getProxies: async urlsAndCountries => {
        for (const urlAndCountry of urlsAndCountries) {
            let { url, country } = urlAndCountry;
            console.log(`Collect proxies from country URL.. (${url})`);

            await page.goto(`http://spys.one${url}`);

            /** 
             * original table consist of only 30 rows, let's make it 500 rows.
             * need to use while loop, because it's not always enough just 1 time to click on 500 rows option
             */
            while (await page.$eval('#xpp > option:nth-child(6)', el => el.selected) == false) {
                await page.select('#xpp', '5');
                await page.waitFor(6000)
            }

            /** create array of proxies for one specific country */
            let proxies = await page.evaluate(() => {
                const listOfProxies = [];
                const rows = document.querySelectorAll('tr[onmouseover="this.style.background=\'#002424\'"]');

                for (const row of rows) {
                    const addressAndPort = row.children[0].innerText;
                    const proxyType = row.children[1].innerText;
                    const anonymity = row.children[2].innerText;
                    const countryCityRegion = row.children[3].innerText;
                    const hostnameOrganization = row.children[4].innerText;
                    const latency = row.children[5].innerText;
                    const speed = row.children[6].children[0].width;
                    const uptime = row.children[7].innerText;
                    const checkDate = row.children[8].innerText;

                    listOfProxies.push({
                        addressAndPort, proxyType, anonymity, countryCityRegion, 
                        hostnameOrganization, latency, speed, uptime, checkDate
                    })
                };

                return listOfProxies;
            })

            let jsonData = JSON.parse(fs.readFileSync('./media/proxies.json', 'utf-8')); // read file with saved proxies
            let newJsonData = [...jsonData, {country, proxies}];
            fs.writeFileSync('./media/proxies.json', JSON.stringify(newJsonData)); // write updated proxy list into file

        }
    },

    /** close the browser */
    end: async () => { await browser.close() }
};

module.exports = spys;
