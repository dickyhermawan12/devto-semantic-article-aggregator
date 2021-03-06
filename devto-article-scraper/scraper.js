const { JSDOM } = require('jsdom')
const axios = require('axios')
const fs = require('fs')

const articleURLlist = [
  'https://dev.to/0xpaulie/accessing-ethereum-archive-nodes-with-infura-op9',
  'https://dev.to/mahmoudgalal/custom-commands-in-your-linux-or-mac-368m',
  'https://dev.to/hr21don/setting-up-the-typewriter-effect-without-css-1p1',
  'https://dev.to/petervanderdoes/human-readable-passwords-17po',
  'https://dev.to/stephanlamoureux/the-complete-windows-developer-setup-guide-fie',
  'https://dev.to/juliecherner/7-tips-to-improve-your-typescript-4o5o',
  'https://dev.to/thawkin3/optimize-your-career-for-growth-93n',
  'https://dev.to/zellwk/understanding-csrf-attacks-36ao',
  'https://dev.to/andrewbaisden/the-complete-modern-react-developer-2022-3257',
  'https://dev.to/andrewbaisden/moving-from-javascript-to-typescript-40ac',
  'https://dev.to/andrewbaisden/what-is-the-most-important-factor-for-you-when-looking-for-work-3dpp',
  'https://dev.to/andrewbaisden/8-github-resources-for-becoming-a-developer-in-2022-cji',
  'https://dev.to/abhirajb/debugging-in-javascript-3de6',
  'https://dev.to/abhirajb/free-resources-for-developers-meg',
  'https://dev.to/bespoyasov/clean-architecture-on-frontend-4311',
  'https://dev.to/saviomartin/20-killer-javascript-one-liners-94f',
  'https://dev.to/saviomartin/free-certification-courses-for-developers-3378',
  'https://dev.to/hyggedev/master-frontend-development-by-cloning-these-websites-1m08',
  'https://dev.to/jamieswift90/the-best-vs-code-extensions-to-supercharge-git-yes-there-s-more-than-gitlens-4588',
  'https://dev.to/jamieswift90/5-simple-css-tricks-to-improve-your-project-or-just-have-fun-trying-nec',
  'https://dev.to/nnekajenny/how-keyboard-events-work-in-javascript-1g66',
  'https://dev.to/ericnanhu/create-a-modern-application-with-django-and-vue-part-one-11l5',
  'https://dev.to/ericnanhu/create-a-modern-application-with-django-and-vue-part-two-2dh3',
  'https://dev.to/ericnanhu/create-a-modern-application-with-django-and-vue-part-three-53he',
  'https://dev.to/ericnanhu/create-a-modern-application-with-django-and-vue-part-four-41eb',
]

const context = {
  devto: 'https://dev.to/',
  schema: 'https://schema.org/',
  articles: {
    '@id': 'devto:articles',
    '@type': 'devto:Article',
  },
  image: 'schema:image',
  url: 'schema:url',
  datePosted: 'schema:datePublished',
  name: 'schema:name',
  description: 'schema:description',
  author: 'devto:Person',
  tags: 'schema:keywords',
  reactions: 'schema:ratingValue',
  authors: {
    '@id': 'devto:authors',
    '@type': 'devto:Person',
  },
  location: 'schema:location',
  joinedOn: 'schema:dateCreated',
  website: 'schema:sameAs',
  education: 'schema:educationalLevel',
  work: 'schema:affiliation',
}

let authors = []

async function fetchAuthorData(authorURL) {
  const { data } = await axios.get(authorURL)
  const dom = new JSDOM(data)
  const { document } = dom.window

  const id = `devto:${authorURL.slice(8).split('/')[1]}`
  const name = document.querySelector('h1.crayons-title')?.textContent
  const image = document
    .querySelector('div.relative.profile-header__top > span > img')
    ?.getAttribute('src')

  let location, joinedOn, education, work
  for (let i = 1; i <= 2; i++) {
    const element = document.querySelector(
      `div.profile-header__details > div > span:nth-child(${i})`
    )

    if (element && element.textContent.includes('Location'))
      location = element.textContent
        .replace(/[\n\r]+|[\s]{2,}/g, ' ')
        .trim()
        .split(' ')
        .splice(2)
        .join(' ')
    else if (element && element.textContent.includes('Joined on'))
      joinedOn = element.children[1].getAttribute('datetime').slice(0, 10)

    const elementBottom = document.querySelector(
      `div.profile-header__bottom.fs-base > div:nth-child(${i})`
    )
    if (
      elementBottom &&
      elementBottom.children[0].textContent.includes('Education')
    )
      education = elementBottom.children[2].textContent
    else if (
      elementBottom &&
      elementBottom.children[0].textContent.includes('Work')
    )
      work = elementBottom.children[2].textContent
  }
  const website =
    document
      .querySelector('div.profile-header__details > div > a:nth-child(3)')
      ?.getAttribute('href') ?? ''
  return {
    name,
    image,
    location: location ?? '',
    joinedOn: joinedOn ?? '',
    website,
    education: education ?? '',
    work: work ?? '',
    '@id': id,
    '@type': 'devto:Person',
  }
}

async function fetchArticleData(articleURL) {
  const { data } = await axios.get(articleURL)
  const dom = new JSDOM(data)
  const { document } = dom.window

  const articleId = document
    .querySelector('#article-show-container')
    .getAttribute('data-article-id')
  const articleReactionURL = `https://dev.to/reactions?article_id=${articleId}`
  const reactions = { ...(await axios.get(articleReactionURL)) }.data
    .article_reaction_counts[0].count

  const authorURL = articleURL.substr(0, articleURL.lastIndexOf('/') + 1)
  const authorData = await fetchAuthorData(authorURL)
  const author = { '@id': authorData['@id'] }

  if (authors.findIndex((x) => x['@id'] === author['@id']) === -1)
    authors.push(authorData)

  const name = document
    .querySelector('div.crayons-article__header__meta > h1')
    ?.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ')
    .trim()
  const description = document.querySelector('#article-body > p')?.textContent
  const image = document
    .querySelector('div.crayons-article__cover > img')
    ?.getAttribute('src')
  const url = articleURL
  const datePosted = document
    .querySelector('div.pl-3.flex-1 > p > time:nth-child(1)')
    .getAttribute('datetime')
    .slice(0, 10)
  const tags = [...document.getElementsByClassName('crayons-tag')].map((item) =>
    item?.textContent.slice(1)
  )

  return {
    name,
    description,
    author,
    image: image ?? '',
    url,
    datePosted,
    reactions,
    tags,
    '@id': `devto:${articleId}`,
    '@type': 'devto:Article',
  }
}

;(async () => {
  try {
    const obtainArticleList = async () => {
      return Promise.all(
        articleURLlist.map((articleURL) => fetchArticleData(articleURL))
      )
    }

    const articleList = await obtainArticleList()
    const dataset = {
      '@context': context,
      articles: articleList,
      authors: authors,
    }

    fs.writeFileSync(
      `../dump/devto-articles-${+new Date()}.jsonld`,
      JSON.stringify(dataset)
    )
  } catch (error) {
    throw error
  }
})()
