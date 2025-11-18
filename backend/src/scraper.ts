import { chromium, Browser, Page } from 'playwright';
import { JobResult } from './types.js';
import { insertJob } from './database.js';

export class GoogleJobScraper {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    // Allow non-headless mode via environment variable (harder to detect)
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
    
    if (!headless) {
      console.log('⚠️  Running in NON-HEADLESS mode (better for avoiding detection)');
    }
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
      permissions: ['geolocation'],
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });
  }

  private async addStealthScripts(page: Page): Promise<void> {
    // Add scripts to make the browser look more realistic
    await page.addInitScript(() => {
      // Override webdriver property
      Object.defineProperty((globalThis as any).navigator, 'webdriver', {
        get: () => false,
      });

      // Override plugins
      Object.defineProperty((globalThis as any).navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Override languages
      Object.defineProperty((globalThis as any).navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Override chrome
      (globalThis as any).chrome = {
        runtime: {},
      };

      // Override permissions
      const nav = (globalThis as any).navigator;
      const originalQuery = nav.permissions?.query;
      if (nav.permissions && originalQuery) {
        nav.permissions.query = (parameters: any) =>
          parameters.name === 'notifications'
            ? Promise.resolve({ state: (globalThis as any).Notification?.permission || 'default' })
            : originalQuery(parameters);
      }
    });
  }

  private async randomDelay(min: number = 1000, max: number = 3000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private async simulateHumanBehavior(page: Page): Promise<void> {
    // Random mouse movements
    await page.mouse.move(Math.random() * 800, Math.random() * 600);
    await this.randomDelay(200, 500);
    await page.mouse.move(Math.random() * 800, Math.random() * 600);
  }

  async scrapeGoogleJobs(
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
      // Add stealth scripts
      await this.addStealthScripts(page);

      // First, visit Google homepage to establish a session
      console.log('Establishing session with Google...');
      await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.randomDelay(2000, 4000);
      await this.simulateHumanBehavior(page);

      // Handle initial cookie consent
      try {
        const acceptSelectors = [
          'button:has-text("Accept")',
          'button:has-text("I agree")',
          '#L2AGLb',
          'button[id*="accept"]',
          'div[role="button"]:has-text("Accept")',
        ];
        
        for (const selector of acceptSelectors) {
          try {
            const button = page.locator(selector).first();
            if (await button.isVisible({ timeout: 2000 })) {
              await button.click();
              await this.randomDelay(1000, 2000);
              break;
            }
          } catch (e) {
            // Try next selector
          }
        }
      } catch (e) {
        // No cookie consent, continue
      }

      for (let i = 0; i < jobSites.length; i++) {
        const site = jobSites[i];
        const query = `${searchQuery} site:${site}`;
        console.log(`Scraping (${i + 1}/${jobSites.length}): ${query}`);

        const results = await this.scrapeGoogleSearch(page, query, site, maxResults);
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

        // Random delay between sites (longer to avoid detection)
        if (i < jobSites.length - 1) {
          const delay = Math.floor(Math.random() * 5000) + 3000; // 3-8 seconds
          console.log(`Waiting ${Math.round(delay / 1000)}s before next site...`);
          await this.randomDelay(delay, delay + 2000);
          await this.simulateHumanBehavior(page);
        }
      }
    } finally {
      await page.close();
      await context.close();
    }

    return allResults;
  }

  private async scrapeGoogleSearch(
    page: Page,
    query: string,
    source: string,
    maxResults: number
  ): Promise<JobResult[]> {
    const results: JobResult[] = [];
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=100`;

    try {
      // Simulate human-like navigation
      await this.simulateHumanBehavior(page);
      
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Wait a bit for content to load with random delay
      await this.randomDelay(2000, 4000);
      
      // Simulate scrolling
      await page.evaluate(() => {
        (globalThis as any).scrollTo(0, Math.random() * 500);
      });
      await this.randomDelay(500, 1000);

      // Handle cookie consent if present
      try {
        const acceptSelectors = [
          'button:has-text("Accept")',
          'button:has-text("I agree")',
          '#L2AGLb',
          'button[id*="accept"]',
          'div[role="button"]:has-text("Accept")',
        ];
        
        for (const selector of acceptSelectors) {
          try {
            const button = page.locator(selector).first();
            if (await button.isVisible({ timeout: 2000 })) {
              await button.click();
              await page.waitForTimeout(1000);
              break;
            }
          } catch (e) {
            // Try next selector
          }
        }
      } catch (e) {
        // No cookie consent, continue
      }

      // Check if we got blocked or CAPTCHA
      const pageContent = await page.content();
      const pageText = await page.textContent('body') || '';
      const pageTitle = await page.title();
      
      if (
        pageContent.includes('captcha') || 
        pageContent.includes('unusual traffic') ||
        pageText.includes('unusual traffic') ||
        pageText.includes('automated queries') ||
        pageTitle.includes('Sorry') ||
        pageContent.includes('Our systems have detected')
      ) {
        console.error(`⚠️  Google blocked request for: ${query}`);
        console.error(`   Page title: ${pageTitle}`);
        console.error(`   Consider: running in non-headless mode, using a proxy, or adding longer delays`);
        return results;
      }

      // Try multiple selector strategies for Google search results
      const selectorStrategies = [
        // Modern Google results
        'div[data-header-feature]',
        // Classic Google results
        'div.g',
        // Alternative structure
        'div[class*="g tF2Cxc"]',
        'div[class*="yuRUbf"]',
        // Generic result containers
        'div[data-ved]',
      ];

      let foundResults = false;

      for (const selector of selectorStrategies) {
        try {
          const searchResults = await page.locator(selector).all();
          console.log(`Trying selector "${selector}": found ${searchResults.length} elements`);

          if (searchResults.length > 0) {
            foundResults = true;
            
            for (const result of searchResults.slice(0, maxResults)) {
              try {
                // Try multiple ways to get title
                let title = '';
                const titleSelectors = ['h3', 'h3.LC20lb', 'h3.DKV0Md', 'a h3'];
                for (const titleSel of titleSelectors) {
                  try {
                    const titleEl = result.locator(titleSel).first();
                    if (await titleEl.isVisible({ timeout: 500 })) {
                      title = (await titleEl.textContent()) || '';
                      if (title) break;
                    }
                  } catch (e) {
                    // Try next selector
                  }
                }

                // Try multiple ways to get URL
                let url = '';
                const linkSelectors = ['a[href]', 'a', 'h3 a'];
                for (const linkSel of linkSelectors) {
                  try {
                    const linkEl = result.locator(linkSel).first();
                    const href = await linkEl.getAttribute('href');
                    if (href && href.startsWith('http')) {
                      url = href;
                      break;
                    } else if (href && href.startsWith('/url')) {
                      url = href;
                      break;
                    }
                  } catch (e) {
                    // Try next selector
                  }
                }

                // Try multiple ways to get snippet/description
                let snippet = '';
                const snippetSelectors = [
                  '.VwiC3b',
                  '.IsZvec',
                  'span[style*="-webkit-line-clamp"]',
                  '.s',
                  'div[data-sncf]',
                ];
                for (const snippetSel of snippetSelectors) {
                  try {
                    const snippetEl = result.locator(snippetSel).first();
                    if (await snippetEl.isVisible({ timeout: 500 })) {
                      snippet = (await snippetEl.textContent()) || '';
                      if (snippet) break;
                    }
                  } catch (e) {
                    // Try next selector
                  }
                }

                // Clean and validate
                url = this.cleanUrl(url);
                
                // Only add if we have title and valid URL
                if (title && url && (url.startsWith('http') || url.startsWith('/url'))) {
                  const { company, location } = this.parseJobInfo(title, snippet);
                  
                  results.push({
                    title: title.trim(),
                    company,
                    location,
                    description: snippet.trim(),
                    url: url,
                    source,
                  });
                }
              } catch (error) {
                console.error(`Error extracting result: ${error}`);
              }
            }

            // If we found results with this selector, break
            if (results.length > 0) {
              break;
            }
          }
        } catch (error) {
          console.error(`Error with selector "${selector}": ${error}`);
        }
      }

      // If still no results, try to get any links from the page
      if (results.length === 0 && !foundResults) {
        console.log('No results found with standard selectors, trying fallback...');
        try {
          const allLinks = await page.locator('a[href*="' + source + '"]').all();
          console.log(`Found ${allLinks.length} links containing ${source}`);
          
          for (const link of allLinks.slice(0, maxResults)) {
            try {
              const url = await link.getAttribute('href');
              const title = await link.textContent();
              
              if (url && title) {
                results.push({
                  title: title.trim(),
                  url: this.cleanUrl(url),
                  source,
                });
              }
            } catch (e) {
              // Skip this link
            }
          }
        } catch (e) {
          console.error(`Fallback extraction failed: ${e}`);
        }
      }

      console.log(`Found ${results.length} results for ${source}`);
    } catch (error) {
      console.error(`Error scraping Google search for ${source}: ${error}`);
    }

    return results;
  }

  private parseJobInfo(title: string, snippet: string): { company?: string; location?: string } {
    // Try to extract company and location from title or snippet
    // This is a simple parser - you may want to enhance it
    const companyMatch = title.match(/- (.+?)$/);
    const locationMatch = snippet.match(/([A-Z][a-z]+(?:, [A-Z][a-z]+)?)/);

    return {
      company: companyMatch ? companyMatch[1].trim() : undefined,
      location: locationMatch ? locationMatch[1].trim() : undefined,
    };
  }

  private cleanUrl(url: string): string {
    if (!url) return '';
    
    // Remove Google redirect prefix if present
    if (url.startsWith('/url?q=')) {
      const match = url.match(/\/url\?q=([^&]+)/);
      if (match) {
        try {
          return decodeURIComponent(match[1]);
        } catch (e) {
          return match[1];
        }
      }
    }
    
    // Handle other Google redirect formats
    if (url.includes('google.com/url?')) {
      const match = url.match(/[?&]url=([^&]+)/);
      if (match) {
        try {
          return decodeURIComponent(match[1]);
        } catch (e) {
          return match[1];
        }
      }
    }
    
    return url;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}


