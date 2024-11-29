const { SitemapStream, streamToPromise } = require('sitemap');
const fs = require('fs');

(async () => {
  const sitemap = new SitemapStream({ hostname: 'https://roseneathholidaypark.au/' });

  const links = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/gallery', changefreq: 'weekly', priority: 0.8 },
    { url: '/about-us', changefreq: 'monthly', priority: 0.5 },
    { url: '/contact-us', changefreq: 'monthly', priority: 0.5 },
    { url: '/investment', changefreq: 'monthly', priority: 0.8 },
    { url: '/roomlist', changefreq: 'weekly', priority: 0.5 },
    // More going here is we got
  ];

  links.forEach(link => sitemap.write(link));
  sitemap.end();

  const sitemapXML = await streamToPromise(sitemap).then((data) => data.toString());

  fs.writeFileSync('sitemap.xml', sitemapXML);
  console.log('✅ Sitemap generated and saved to sitemap.xml');
})();
