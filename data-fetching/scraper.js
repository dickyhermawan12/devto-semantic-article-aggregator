const { JSDOM } = require("jsdom")
const axios = require('axios')

const articleURLlist = [
  "https://dev.to/ryansolid/when-netlify-asks-you-to-full-time-oss-you-say-yes-5ccf",
  "https://dev.to/andrewbaisden/how-to-do-test-driven-development-in-react-using-react-testing-library-jest-and-cypress-1d1i"
];

async function fetchAuthorData(authorURL) {
  const { data } = await axios.get(authorURL);
  const dom = new JSDOM(data);
  const { document } = dom.window;

  const name = document.querySelector('h1.crayons-title')?.textContent;
  const image = document.querySelector('div.relative.profile-header__top > span > img')?.getAttribute('src');
  const location = document.querySelector('div.profile-header__details > div > span:nth-child(1)')?.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim();
  const joinedOn = document.querySelector('div.profile-header__details > div > span:nth-child(2) > time')?.getAttribute('datetime').slice(0,10);
  const website = document.querySelector('div.profile-header__details > div > a:nth-child(3)')?.getAttribute('href');
  const education = document.querySelector('div.profile-header__bottom.fs-base > div:nth-child(1) > p:nth-child(3)')?.textContent;
  const work = document.querySelector('div.profile-header__bottom.fs-base > div:nth-child(2) > p:nth-child(3)')?.textContent;
  return { name, image, location, joinedOn, website, education, work };
}

async function fetchArticleData(articleURL) {
  const { data } = await axios.get(articleURL);
  const dom = new JSDOM(data);
  const { document } = dom.window;

  const articleId = document.querySelector('#article-show-container').getAttribute('data-article-id');
  const articleReactionURL = `https://dev.to/reactions?article_id=${articleId}`;
  const reactions = {...await axios.get(articleReactionURL)}.data.article_reaction_counts[0].count;

  const authorURL = articleURL.substr(0, articleURL.lastIndexOf("/") + 1);
  const author = await fetchAuthorData(authorURL);

  const name = document.querySelector('div.crayons-article__header__meta > h1')?.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim();
  const description = document.querySelector('#article-body > p')?.textContent;
  const image = document.querySelector('div.crayons-article__cover > img').getAttribute('src');
  const url = articleURL;
  const datePosted = document.querySelector('div.pl-3.flex-1 > p > time:nth-child(1)').getAttribute('datetime').slice(0,10);
  const tags = [...document.getElementsByClassName('crayons-tag')].map(item => item?.textContent.slice(1));

  return { name, description, author, image, url, datePosted, reactions, tags };
}

(async () => {
  try {
    const obtainArticleList = async () => {
      return Promise.all(articleURLlist.map(articleURL => fetchArticleData(articleURL)));
    }

    const articleList = await obtainArticleList();

    console.log(articleList)
  } catch (error) {
    throw error;
  }
})();
