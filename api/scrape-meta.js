const playwright = require('playwright-aws-lambda');

const scrape = async url => {
const browser = await playwright.launchChromium({
    headless: false,
});
const context = await browser.newContext();
  const page = await context.newPage();
  console.log('before');
  await page.goto(url, { waitUntil: 'load', referer: url });
  console.log('after');
  const ogFields = await page
    .evaluate(() => {
      const description =
        document.head
          .querySelector('meta[property="og:description"]')
          ?.getAttribute("content") ?? null;
      const title =
        document.head
          .querySelector('meta[property="og:title"]')
          ?.getAttribute("content") ?? null;
      const type =
        document.head
          .querySelector('meta[property="og:type"]')
          ?.getAttribute("content") ?? null;
      const image =
        document.head
          .querySelector('meta[property="og:image"]')
          ?.getAttribute("content") ?? null;
      const url =
        document.head
          .querySelector('meta[property="og:url"]')
          ?.getAttribute("content") ?? null;
      return { description, title, type, image, url };
    })
    .catch(e => {
        browser.close();
      return {};
    });
  const title = await page.title();
  const buffer = await page.screenshot();
  browser.close();
  return { ...ogFields, title, screenshot: buffer.toString('base64') };
};

const meta = async (req, res) => {
  const { url } = req.body;
  console.log(url);
  const description = await scrape(url);
  res.status(200).send(description);
};

export default meta;
