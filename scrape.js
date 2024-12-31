import puppeteer from "puppeteer-extra";
import fs from "fs/promises";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

const MAX_CONCURRENT_PAGES = 10; // Set this to control the number of concurrent pages
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to scrape a single site
const ScrapThroughSites = async (browser, url) => {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const imageItems = await page.$$(".next-slick-slide"); // Get all image elements
    const Allimages = [];

    for (const items of imageItems) {
      await items.click();
      await delay(100); // Reduced delay
      const imgSrc = await page.evaluate(
        () => document.querySelector(".pdp-mod-common-image").src
      );
      Allimages.push(imgSrc);
    }

    // Check if the first image is a video URL
    if (Allimages.length < 3 || (Allimages[0] && Allimages[0].startsWith("https://video-play"))) {
      // Skip adding to failureUrl if it's a video
      console.log(`Skipped URL due to video: ${url}`);
      await page.close();
      return { error: "Video" }; // Return a specific error for clarity
    }

    const result = await page.evaluate(() => {
      const h1Element = document.querySelector("h1");
      const sections = document.querySelectorAll(".sku-prop-selection");
      const highlightsElement = document.querySelector(".pdp-product-highlights");
      const description = highlightsElement ? highlightsElement.textContent : "Description not found.";
      
      const extractedData = {};

      sections.forEach((section) => {
        const topicElement = section.querySelector("h6.section-title");
        const topic = topicElement ? topicElement.innerText.trim() : "Unknown";
        const values = Array.from(
          section.querySelectorAll(".sku-variable-name-text")
        ).map((span) => span.innerText.trim());

        if (values.length > 0) {
          extractedData[topic] = values;
        }
      });
      const title = h1Element ? h1Element.innerText : null;

      return {
        title: title,
        price: (Math.random() * 99 + 1).toFixed(2),
        type: extractedData,
        description: description,
        id: title
          .toLowerCase()
          .replace(/[^\w\s]/g, "")
          .replace(/ /g, "-"),
      };
    });

    const allData = {
      ...result,
      thumbnail: Allimages[0],
      images: Allimages,
      category: "Stationery",
    };

    await page.close();
    return allData;
  } catch (err) {
    await page.close();
    return { error: true };
  }
};

// Main function
puppeteer
  .launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })
  .then(async (browser) => {
    const urlFile = await fs.readFile("woman_product.txt", "utf-8");
    const websiteUrls = urlFile.split("\n").filter(Boolean); // Ensure no empty lines
    const failureUrl = [];
    let successData = [];
    let successUrlCount = 0;

    // Parallel scraping function
    const runScrapeBatch = async (urls) => {
      const scrapePromises = urls.map((url) => ScrapThroughSites(browser, url));
      const results = await Promise.all(scrapePromises);

      results.forEach((result, index) => {
        if (result?.error && result.error !== "Video") {
          failureUrl.push(urls[index]);
        } else if (result.error === "Video") {
          // Skip adding to failureUrl
        } else {
          successUrlCount++;
          successData.push(result);
        }
      });
    };

    // Scrape in batches to limit concurrency
    for (let i = 0; i < websiteUrls.length; i += MAX_CONCURRENT_PAGES) {
      const batch = websiteUrls.slice(i, i + MAX_CONCURRENT_PAGES);
      await runScrapeBatch(batch);
      console.log(`Processed batch: ${i + 1} to ${i + batch.length}`);
    }

    console.log("Total failed URLs:", failureUrl.length);
    console.log("Total successful URLs:", successData.length);

    // Save successful data to file
    const successFilePath = "success.json";
    let json = [];
    try {
      const data = await fs.readFile(successFilePath, "utf8");
      if (data.trim()) {
        json = JSON.parse(data);
      }
    } catch (err) {
      console.log("Success file not found, creating a new one.");
    }
    json.push(...successData);
    await fs.writeFile(successFilePath, JSON.stringify(json, null, 2));
    console.log("Saved successful data to success.json");

    // Save failed URLs
    await fs.writeFile("woman_product.txt", failureUrl.join("\n"));
    console.log("Saved failed URLs to failed.txt");

    await browser.close();
  });
