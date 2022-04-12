import chromium from 'chrome-aws-lambda';

const scrape = async url => {
  const browser = await chromium.puppeteer.launch({
    args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: false,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();

  await page.goto(url);
  await page.waitForNetworkIdle();
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
  browser.close();
  return ogFields;
};

const meta = async (req, res) => {
  const { url } = req.body;
  console.log(url);
  const description = await scrape(url);
  res.status(200).send(description);
};

export default meta;
