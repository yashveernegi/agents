import puppeteer from "puppeteer";
export async function scrapeWebsite(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "networkidle2",
  });

  const text = await page.evaluate(() => {
    return document.body.innerText
      .replace(/\s+/g, " ")
      .trim();
  });

  await browser.close();

  return text;
}