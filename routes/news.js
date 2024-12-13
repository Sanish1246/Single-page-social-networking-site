import express from 'express';
import puppeteer from 'puppeteer';

const router = express.Router();

router.get('/news/:page', async (req, res) => {
  const db = req.app.locals.db;
  let page = req.params.page;
  let limit = 10;

  let skip = (page - 1) * limit;
  try {
     if (page==1){
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      await page.setRequestInterception(true);
      page.on('request', (req) => {
          if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
              req.abort();
          } else {
              req.continue();
          }
      });

      await page.goto('https://www.ign.com/news', { timeout: 60000, waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.item-body', { timeout: 60000 });

      let news = await page.evaluate(() => {
          const newsElements = document.querySelectorAll('.item-body');
          const newsArray = [];

          for (const newsElement of newsElements) {
              const isGameNews = newsElement.querySelector('[data-cy="icon-game-object"]');

              if (isGameNews) {
                  const newsTitle = newsElement.querySelector('.item-title')?.innerText;
                  const newsImgElement = newsElement.querySelector('.item-thumbnail img');
                  const newsLink = newsElement.getAttribute('href');
                  let newsImg = newsImgElement?.src;

                  if (newsImg.includes('dpr=')) {
                      newsImg = newsImg.replace(/dpr=\d+/, 'dpr=2');
                  }

                  const newsContent = newsElement.querySelector('.item-subtitle')?.innerText;
                  let cleanNewsContent = newsContent ? newsContent.split(' - ').slice(1).join(' - ') : null;

                  if (newsTitle && newsImg) {
                      newsArray.push({
                          title: newsTitle,
                          img: newsImg,
                          content: cleanNewsContent,
                          link: `https://www.ign.com${newsLink}`
                      });
                  }
              }
          }
          return newsArray;
      });

      await browser.close();

      news = news.reverse();

          for (const article of news) {
              await db.collection('News').updateOne(
                  { link: article.link },
                  { $set: article },
                  { upsert: true }
              );
          }  
     }

      let allNews = await db.collection('News')
      .find()
      .sort({ _id: -1 }) 
      .skip(skip) 
      .limit(limit) 
      .toArray();

      res.status(200).json(allNews);

  } catch (err) {
      console.error('Error fetching news:', err);
      res.status(500).json({ error: 'Error fetching news' });
  }
});

export default router;
