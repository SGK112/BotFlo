const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

class ChatBotComScraper {
    constructor() {
        this.baseUrl = 'https://www.chatbot.com';
        this.scrapedData = {
            pages: {},
            features: {},
            uiPatterns: {},
            technicalStack: {},
            designPatterns: {}
        };
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        };
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async scrapePage(url, description = '') {
        try {
            console.log(`Scraping: ${url}`);
            
            const response = await axios.get(url, { 
                headers: this.headers,
                timeout: 15000
            });
            
            const $ = cheerio.load(response.data);
            
            // Extract key elements
            const pageData = {
                url,
                description,
                title: $('title').text().trim(),
                metaDescription: $('meta[name="description"]').attr('content') || '',
                
                // UI/UX Patterns
                navigation: this.extractNavigation($),
                ctaButtons: this.extractCTAButtons($),
                forms: this.extractForms($),
                animations: this.extractAnimations($),
                
                // Content Structure
                headlines: this.extractHeadlines($),
                features: this.extractFeatures($),
                testimonials: this.extractTestimonials($),
                
                // Technical Elements
                scripts: this.extractScripts($),
                styles: this.extractStyles($),
                images: this.extractImages($),
                
                // Chatbot Specific
                chatWidgets: this.extractChatWidgets($),
                visualBuilderElements: this.extractVisualBuilderElements($),
                aiFeatures: this.extractAIFeatures($),
                
                timestamp: new Date().toISOString()
            };
            
            this.scrapedData.pages[url] = pageData;
            await this.delay(2000); // Be respectful with requests
            
            return pageData;
            
        } catch (error) {
            console.error(`Error scraping ${url}:`, error.message);
            return null;
        }
    }

    extractNavigation($) {
        const nav = [];
        $('nav a, .navigation a, .menu a, .nav-link').each((i, el) => {
            const $el = $(el);
            nav.push({
                text: $el.text().trim(),
                href: $el.attr('href'),
                classes: $el.attr('class')
            });
        });
        return nav;
    }

    extractCTAButtons($) {
        const buttons = [];
        $('button, .btn, .cta, a[class*="button"], a[class*="btn"]').each((i, el) => {
            const $el = $(el);
            buttons.push({
                text: $el.text().trim(),
                href: $el.attr('href'),
                classes: $el.attr('class'),
                style: $el.attr('style'),
                type: $el.prop('tagName').toLowerCase()
            });
        });
        return buttons;
    }

    extractForms($) {
        const forms = [];
        $('form').each((i, el) => {
            const $form = $(el);
            const inputs = [];
            $form.find('input, select, textarea').each((j, input) => {
                const $input = $(input);
                inputs.push({
                    type: $input.attr('type'),
                    name: $input.attr('name'),
                    placeholder: $input.attr('placeholder'),
                    required: $input.attr('required') !== undefined
                });
            });
            
            forms.push({
                action: $form.attr('action'),
                method: $form.attr('method'),
                classes: $form.attr('class'),
                inputs
            });
        });
        return forms;
    }

    extractAnimations($) {
        const animations = [];
        
        // Look for common animation libraries and patterns
        $('[class*="animate"], [data-aos], [class*="fade"], [class*="slide"]').each((i, el) => {
            const $el = $(el);
            animations.push({
                element: el.tagName.toLowerCase(),
                classes: $el.attr('class'),
                dataAttributes: this.getDataAttributes($el)
            });
        });
        
        return animations;
    }

    extractHeadlines($) {
        const headlines = [];
        $('h1, h2, h3, h4, h5, h6').each((i, el) => {
            const $el = $(el);
            headlines.push({
                level: el.tagName.toLowerCase(),
                text: $el.text().trim(),
                classes: $el.attr('class')
            });
        });
        return headlines;
    }

    extractFeatures($) {
        const features = [];
        
        // Look for feature sections
        $('[class*="feature"], [class*="benefit"], .card, [class*="service"]').each((i, el) => {
            const $el = $(el);
            const $title = $el.find('h1, h2, h3, h4, h5, h6').first();
            const $description = $el.find('p').first();
            
            features.push({
                title: $title.text().trim(),
                description: $description.text().trim(),
                classes: $el.attr('class'),
                icon: $el.find('i, svg, img').attr('class') || $el.find('img').attr('src')
            });
        });
        
        return features;
    }

    extractTestimonials($) {
        const testimonials = [];
        
        $('[class*="testimonial"], [class*="review"], [class*="quote"]').each((i, el) => {
            const $el = $(el);
            testimonials.push({
                text: $el.text().trim(),
                author: $el.find('[class*="author"], [class*="name"]').text().trim(),
                classes: $el.attr('class')
            });
        });
        
        return testimonials;
    }

    extractScripts($) {
        const scripts = [];
        $('script').each((i, el) => {
            const $el = $(el);
            const src = $el.attr('src');
            if (src) {
                scripts.push({
                    src,
                    type: $el.attr('type'),
                    async: $el.attr('async') !== undefined,
                    defer: $el.attr('defer') !== undefined
                });
            }
        });
        return scripts;
    }

    extractStyles($) {
        const styles = [];
        $('link[rel="stylesheet"]').each((i, el) => {
            const $el = $(el);
            styles.push({
                href: $el.attr('href'),
                media: $el.attr('media')
            });
        });
        return styles;
    }

    extractImages($) {
        const images = [];
        $('img').each((i, el) => {
            const $el = $(el);
            images.push({
                src: $el.attr('src'),
                alt: $el.attr('alt'),
                classes: $el.attr('class'),
                loading: $el.attr('loading')
            });
        });
        return images;
    }

    extractChatWidgets($) {
        const widgets = [];
        
        // Look for chat-related elements
        $('[class*="chat"], [class*="widget"], [class*="messenger"]').each((i, el) => {
            const $el = $(el);
            widgets.push({
                classes: $el.attr('class'),
                id: $el.attr('id'),
                dataAttributes: this.getDataAttributes($el),
                html: $el.html()?.substring(0, 500) // Truncate for brevity
            });
        });
        
        return widgets;
    }

    extractVisualBuilderElements($) {
        const builderElements = [];
        
        // Look for visual builder related elements
        $('[class*="builder"], [class*="visual"], [class*="drag"], [class*="drop"], [class*="flow"]').each((i, el) => {
            const $el = $(el);
            builderElements.push({
                classes: $el.attr('class'),
                id: $el.attr('id'),
                dataAttributes: this.getDataAttributes($el)
            });
        });
        
        return builderElements;
    }

    extractAIFeatures($) {
        const aiFeatures = [];
        
        // Look for AI-related elements
        $('[class*="ai"], [class*="artificial"], [class*="intelligence"], [class*="smart"]').each((i, el) => {
            const $el = $(el);
            aiFeatures.push({
                text: $el.text().trim().substring(0, 200),
                classes: $el.attr('class'),
                tag: el.tagName.toLowerCase()
            });
        });
        
        return aiFeatures;
    }

    getDataAttributes($el) {
        const dataAttrs = {};
        if ($el[0] && $el[0].attribs) {
            Object.keys($el[0].attribs).forEach(attr => {
                if (attr.startsWith('data-')) {
                    dataAttrs[attr] = $el[0].attribs[attr];
                }
            });
        }
        return dataAttrs;
    }

    async scrapeFullSite() {
        const urlsToScrape = [
            { url: 'https://www.chatbot.com/', description: 'Homepage' },
            { url: 'https://www.chatbot.com/features/', description: 'Features Overview' },
            { url: 'https://www.chatbot.com/features/visual-builder/', description: 'Visual Builder' },
            { url: 'https://www.chatbot.com/features/ai/', description: 'AI Features' },
            { url: 'https://www.chatbot.com/features/analytics/', description: 'Analytics' },
            { url: 'https://www.chatbot.com/chatbot-demo/', description: 'Demo Page' },
            { url: 'https://www.chatbot.com/pricing/', description: 'Pricing' },
            { url: 'https://www.chatbot.com/chatbot-templates/', description: 'Templates' },
            { url: 'https://www.chatbot.com/integrations/', description: 'Integrations' },
            { url: 'https://www.chatbot.com/help/', description: 'Help Center' }
        ];

        console.log('Starting comprehensive ChatBot.com scraping...');
        
        for (const { url, description } of urlsToScrape) {
            await this.scrapePage(url, description);
        }

        // Analyze patterns
        this.analyzePatterns();
        
        // Save results
        await this.saveResults();
        
        console.log('Scraping completed successfully!');
        return this.scrapedData;
    }

    analyzePatterns() {
        console.log('Analyzing UI/UX patterns...');
        
        // Analyze common UI patterns
        const allButtons = [];
        const allForms = [];
        const allAnimations = [];
        
        Object.values(this.scrapedData.pages).forEach(page => {
            allButtons.push(...page.ctaButtons);
            allForms.push(...page.forms);
            allAnimations.push(...page.animations);
        });
        
        this.scrapedData.uiPatterns = {
            buttonPatterns: this.findCommonPatterns(allButtons, 'classes'),
            formPatterns: this.findCommonPatterns(allForms, 'classes'),
            animationPatterns: this.findCommonPatterns(allAnimations, 'classes'),
            commonCTATexts: this.findCommonPatterns(allButtons, 'text')
        };
        
        // Analyze technical stack
        const allScripts = [];
        const allStyles = [];
        
        Object.values(this.scrapedData.pages).forEach(page => {
            allScripts.push(...page.scripts);
            allStyles.push(...page.styles);
        });
        
        this.scrapedData.technicalStack = {
            commonScripts: this.findCommonPatterns(allScripts, 'src'),
            commonStyles: this.findCommonPatterns(allStyles, 'href'),
            frameworks: this.identifyFrameworks(allScripts, allStyles)
        };
    }

    findCommonPatterns(items, property) {
        const frequency = {};
        items.forEach(item => {
            const value = item[property];
            if (value) {
                frequency[value] = (frequency[value] || 0) + 1;
            }
        });
        
        return Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([value, count]) => ({ value, count }));
    }

    identifyFrameworks(scripts, styles) {
        const frameworks = {
            css: [],
            js: [],
            analytics: [],
            cdn: []
        };
        
        scripts.forEach(script => {
            if (script.src) {
                if (script.src.includes('analytics') || script.src.includes('gtag')) {
                    frameworks.analytics.push(script.src);
                } else if (script.src.includes('cdn')) {
                    frameworks.cdn.push(script.src);
                } else {
                    frameworks.js.push(script.src);
                }
            }
        });
        
        styles.forEach(style => {
            if (style.href) {
                if (style.href.includes('font') || style.href.includes('google')) {
                    frameworks.css.push(style.href);
                }
            }
        });
        
        return frameworks;
    }

    async saveResults() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `chatbot_com_analysis_${timestamp}.json`;
        const filepath = path.join(__dirname, 'scraped_data', filename);
        
        // Create directory if it doesn't exist
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Save detailed analysis
        fs.writeFileSync(filepath, JSON.stringify(this.scrapedData, null, 2));
        
        // Save summary report
        const summary = this.generateSummaryReport();
        const summaryPath = path.join(__dirname, 'scraped_data', `summary_${timestamp}.md`);
        fs.writeFileSync(summaryPath, summary);
        
        console.log(`Results saved to: ${filepath}`);
        console.log(`Summary saved to: ${summaryPath}`);
    }

    generateSummaryReport() {
        const pages = Object.keys(this.scrapedData.pages).length;
        const totalFeatures = Object.values(this.scrapedData.pages)
            .reduce((acc, page) => acc + page.features.length, 0);
        
        return `# ChatBot.com Analysis Report

## Overview
- **Pages Analyzed**: ${pages}
- **Total Features Identified**: ${totalFeatures}
- **Analysis Date**: ${new Date().toISOString()}

## Key Findings

### UI/UX Patterns
${this.formatPatterns(this.scrapedData.uiPatterns)}

### Technical Stack
${this.formatTechnicalStack(this.scrapedData.technicalStack)}

### Recommendations for Implementation

1. **Visual Builder Interface**
   - Implement drag-and-drop functionality
   - Use modular component system
   - Provide real-time preview

2. **AI Integration**
   - Website content scanning
   - Natural language processing
   - Custom knowledge base training

3. **User Experience**
   - Clean, modern design
   - Intuitive navigation
   - Progressive disclosure of features

4. **Technical Implementation**
   - Use modern CSS frameworks
   - Implement proper analytics tracking
   - Ensure mobile responsiveness

## Next Steps
1. Implement core visual builder functionality
2. Develop AI training interface
3. Create template system
4. Build analytics dashboard
5. Implement multi-channel support
`;
    }

    formatPatterns(patterns) {
        if (!patterns) return 'No patterns analyzed yet.';
        
        let output = '';
        Object.entries(patterns).forEach(([key, values]) => {
            output += `\n#### ${key}\n`;
            if (Array.isArray(values)) {
                values.slice(0, 5).forEach(item => {
                    output += `- ${item.value} (${item.count} occurrences)\n`;
                });
            }
        });
        return output;
    }

    formatTechnicalStack(stack) {
        if (!stack) return 'No technical stack analyzed yet.';
        
        let output = '';
        Object.entries(stack).forEach(([key, values]) => {
            output += `\n#### ${key}\n`;
            if (Array.isArray(values)) {
                values.slice(0, 5).forEach(item => {
                    if (typeof item === 'string') {
                        output += `- ${item}\n`;
                    } else {
                        output += `- ${item.value} (${item.count} times)\n`;
                    }
                });
            }
        });
        return output;
    }
}

// Export for use in other modules
module.exports = ChatBotComScraper;

// Run if called directly
if (require.main === module) {
    const scraper = new ChatBotComScraper();
    scraper.scrapeFullSite().catch(console.error);
}
