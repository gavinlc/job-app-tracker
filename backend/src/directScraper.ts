import { chromium, Browser, Page } from 'playwright';
import { JobResult } from './types.js';
import { insertJob } from './database.js';

export class DirectJobScraper {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    const headless = process.env.HEADLESS !== 'false';
    
    this.browser = await chromium.launch({
      headless: headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
      ],
    });
  }

  private async createContext() {
    if (!this.browser) {
      await this.initialize();
    }
    return await this.browser!.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezoneId: 'America/New_York',
    });
  }

  private async randomDelay(min: number = 1000, max: number = 3000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async scrapeJobs(
    jobSites: string[],
    searchQuery: string,
    maxResults: number = 50
  ): Promise<JobResult[]> {
    if (!this.browser) {
      await this.initialize();
    }

    const context = await this.createContext();
    const page = await context.newPage();
    const allResults: JobResult[] = [];

    try {
      for (let i = 0; i < jobSites.length; i++) {
        const site = jobSites[i];
        console.log(`Scraping directly from ${site} (${i + 1}/${jobSites.length})...`);

        const results = await this.scrapeSite(page, site, searchQuery, maxResults);
        allResults.push(...results);

        // Store results in database
        for (const job of results) {
          try {
            insertJob.run(
              job.title,
              job.company || null,
              job.location || null,
              job.description || null,
              job.url,
              job.source
            );
          } catch (error) {
            console.error(`Error inserting job: ${error}`);
          }
        }

        // Delay between sites
        if (i < jobSites.length - 1) {
          await this.randomDelay(2000, 4000);
        }
      }
    } finally {
      await page.close();
      await context.close();
    }

    return allResults;
  }

  private async scrapeSite(
    page: Page,
    site: string,
    searchQuery: string,
    maxResults: number
  ): Promise<JobResult[]> {
    const results: JobResult[] = [];

    try {
      // Map sites to their search URLs and scraping strategies
      const siteConfig = this.getSiteConfig(site);
      if (!siteConfig) {
        console.log(`No direct scraping config for ${site}, skipping...`);
        return results;
      }

      const searchUrl = siteConfig.getSearchUrl(searchQuery);
      console.log(`  Visiting: ${searchUrl}`);

      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.randomDelay(2000, 4000);

      // Wait for job listings to load
      try {
        await page.waitForSelector(siteConfig.jobSelector, { timeout: 10000 });
      } catch (e) {
        console.log(`  No jobs found or page structure different for ${site}`);
        return results;
      }

      const jobElements = await page.locator(siteConfig.jobSelector).all();
      console.log(`  Found ${jobElements.length} job listings`);

      for (const jobEl of jobElements.slice(0, maxResults)) {
        try {
          const job = await siteConfig.extractJob(jobEl, page);
          if (job && job.title && job.url) {
            results.push({
              title: job.title,
              company: job.company,
              location: job.location,
              description: job.description,
              url: job.url,
              source: site,
            });
          }
        } catch (error) {
          console.error(`  Error extracting job from ${site}: ${error}`);
        }
      }

      console.log(`  Successfully extracted ${results.length} jobs from ${site}`);
    } catch (error) {
      console.error(`Error scraping ${site}: ${error}`);
    }

    return results;
  }

  private getSiteConfig(site: string): SiteScraperConfig | null {
    const configs: Record<string, SiteScraperConfig> = {
      'icims.com': {
        getSearchUrl: (query: string) => {
          // Use DuckDuckGo instead of Google to avoid blocking
          return `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' site:icims.com')}`;
        },
        jobSelector: '.result, .web-result, .links_main',
        extractJob: async (el, page) => {
          const titleEl = el.locator('a.result__a, .result__title, a').first();
          const linkEl = el.locator('a.result__a, a').first();
          const snippetEl = el.locator('.result__snippet, .result__body').first();

          const title = await titleEl.textContent() || '';
          let url = await linkEl.getAttribute('href') || '';
          const snippet = await snippetEl.textContent() || '';

          return {
            title: title.trim(),
            description: snippet.trim() || undefined,
            url: url || undefined,
          };
        },
      },
      'apply.workable.com': {
        getSearchUrl: (query: string) => 
          `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' site:apply.workable.com')}`,
        jobSelector: '.result, .web-result, .links_main',
        extractJob: async (el, page) => {
          const titleEl = el.locator('a.result__a, .result__title, a').first();
          const linkEl = el.locator('a.result__a, a').first();
          const snippetEl = el.locator('.result__snippet, .result__body').first();

          const title = await titleEl.textContent() || '';
          let url = await linkEl.getAttribute('href') || '';
          const snippet = await snippetEl.textContent() || '';

          return {
            title: title.trim(),
            description: snippet.trim() || undefined,
            url: url || undefined,
          };
        },
      },
      'greenhouse.io': {
        getSearchUrl: (query: string) => 
          `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' site:boards.greenhouse.io')}`,
        jobSelector: '.result, .web-result, .links_main',
        extractJob: async (el, page) => {
          const titleEl = el.locator('a.result__a, .result__title, a').first();
          const linkEl = el.locator('a.result__a, a').first();
          const snippetEl = el.locator('.result__snippet, .result__body').first();

          const title = await titleEl.textContent() || '';
          let url = await linkEl.getAttribute('href') || '';
          const snippet = await snippetEl.textContent() || '';

          return {
            title: title.trim(),
            description: snippet.trim() || undefined,
            url: url || undefined,
          };
        },
      },
      'jobs.smartrecruiters.com': {
        getSearchUrl: (query: string) => 
          `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' site:jobs.smartrecruiters.com')}`,
        jobSelector: '.result, .web-result, .links_main',
        extractJob: async (el, page) => {
          const titleEl = el.locator('a.result__a, .result__title, a').first();
          const linkEl = el.locator('a.result__a, a').first();
          const snippetEl = el.locator('.result__snippet, .result__body').first();

          const title = await titleEl.textContent() || '';
          let url = await linkEl.getAttribute('href') || '';
          const snippet = await snippetEl.textContent() || '';

          return {
            title: title.trim(),
            description: snippet.trim() || undefined,
            url: url || undefined,
          };
        },
      },
      'lever.co': {
        getSearchUrl: (query: string) => 
          `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' site:jobs.lever.co')}`,
        jobSelector: '.result, .web-result, .links_main',
        extractJob: async (el, page) => {
          const titleEl = el.locator('a.result__a, .result__title, a').first();
          const linkEl = el.locator('a.result__a, a').first();
          const snippetEl = el.locator('.result__snippet, .result__body').first();

          const title = await titleEl.textContent() || '';
          let url = await linkEl.getAttribute('href') || '';
          const snippet = await snippetEl.textContent() || '';

          return {
            title: title.trim(),
            description: snippet.trim() || undefined,
            url: url || undefined,
          };
        },
      },
      'myworkdayjobs.com': {
        getSearchUrl: (query: string) => 
          `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' site:myworkdayjobs.com')}`,
        jobSelector: '.result, .web-result, .links_main',
        extractJob: async (el, page) => {
          const titleEl = el.locator('a.result__a, .result__title, a').first();
          const linkEl = el.locator('a.result__a, a').first();
          const snippetEl = el.locator('.result__snippet, .result__body').first();

          const title = await titleEl.textContent() || '';
          let url = await linkEl.getAttribute('href') || '';
          const snippet = await snippetEl.textContent() || '';

          return {
            title: title.trim(),
            description: snippet.trim() || undefined,
            url: url || undefined,
          };
        },
      },
    };

    // Try exact match first
    if (configs[site]) {
      return configs[site];
    }

    // Try partial match (e.g., "apply.workable.com" matches "workable.com")
    for (const [key, config] of Object.entries(configs)) {
      if (site.includes(key) || key.includes(site)) {
        return config;
      }
    }

    return null;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

interface SiteScraperConfig {
  getSearchUrl: (query: string) => string;
  jobSelector: string;
  extractJob: (element: any, page: Page) => Promise<Partial<JobResult>>;
}

