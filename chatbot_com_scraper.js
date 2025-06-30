const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

class WebsiteChatbotScraper {
    constructor() {
        this.scrapedData = {
            pages: {},
            content: [],
            faqs: [],
            features: [],
            metadata: {}
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

    async scrapeWebsiteForChatbot(url, options = {}) {
        try {
            console.log(`🚀 Starting website analysis for: ${url}`);
            
            const baseUrl = new URL(url).origin;
            const result = {
                url,
                success: true,
                chatbotData: {},
                trainingData: [],
                error: null,
                timestamp: new Date().toISOString()
            };

            // Step 1: Scrape main page
            console.log('📄 Analyzing main page content...');
            const mainPageData = await this.scrapePage(url);
            
            // Step 2: Extract navigation and key pages
            console.log('🔍 Finding important pages...');
            const importantPages = this.findImportantPages(mainPageData, baseUrl);
            
            // Step 3: Scrape additional pages
            console.log('📚 Analyzing additional pages...');
            const additionalData = await this.scrapeMultiplePages(importantPages.slice(0, 5)); // Limit to 5 pages
            
            // Step 4: Process content for chatbot training
            console.log('🧠 Processing content for AI training...');
            const trainingData = this.processContentForTraining([mainPageData, ...additionalData]);
            
            // Step 5: Generate chatbot configuration
            console.log('⚙️ Generating chatbot configuration...');
            const chatbotConfig = this.generateChatbotConfig(trainingData, mainPageData);
            
            result.chatbotData = chatbotConfig;
            result.trainingData = trainingData;
            
            console.log('✅ Website analysis complete!');
            return result;
            
        } catch (error) {
            console.error('❌ Website scraping failed:', error);
            return {
                url,
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async scrapePage(url) {
        try {
            console.log(`Analyzing: ${url}`);
            
            const response = await axios.get(url, { 
                headers: this.headers,
                timeout: 15000,
                maxRedirects: 3
            });
            
            const $ = cheerio.load(response.data);
            
            return {
                url,
                title: $('title').text().trim(),
                metaDescription: $('meta[name="description"]').attr('content') || '',
                headings: this.extractHeadings($),
                content: this.extractTextContent($),
                links: this.extractLinks($, url),
                images: this.extractImages($, url),
                forms: this.extractForms($),
                faqs: this.extractFAQs($),
                contactInfo: this.extractContactInfo($),
                features: this.extractFeatures($),
                navigation: this.extractNavigation($)
            };
            
        } catch (error) {
            console.warn(`Failed to scrape ${url}:`, error.message);
            return null;
        }
    }

    extractHeadings($) {
        const headings = [];
        $('h1, h2, h3, h4, h5, h6').each((i, el) => {
            const text = $(el).text().trim();
            if (text && text.length > 3) {
                headings.push({
                    level: el.tagName.toLowerCase(),
                    text: text,
                    id: $(el).attr('id') || ''
                });
            }
        });
        return headings;
    }

    extractTextContent($) {
        const content = [];
        
        // Extract paragraphs
        $('p').each((i, el) => {
            const text = $(el).text().trim();
            if (text && text.length > 20) {
                content.push({
                    type: 'paragraph',
                    text: text,
                    context: this.getElementContext($(el))
                });
            }
        });
        
        // Extract lists
        $('ul, ol').each((i, el) => {
            const items = [];
            $(el).find('li').each((j, li) => {
                const text = $(li).text().trim();
                if (text) items.push(text);
            });
            
            if (items.length > 0) {
                content.push({
                    type: 'list',
                    items: items,
                    context: this.getElementContext($(el))
                });
            }
        });
        
        return content;
    }

    extractFAQs($) {
        const faqs = [];
        
        // Common FAQ patterns
        const faqSelectors = [
            '.faq', '.frequently-asked-questions', '.qa', '.question-answer',
            '[class*="faq"]', '[class*="question"]', '[id*="faq"]'
        ];
        
        faqSelectors.forEach(selector => {
            $(selector).each((i, el) => {
                const question = $(el).find('h3, h4, h5, .question, .q, [class*="question"]').first().text().trim();
                const answer = $(el).find('p, .answer, .a, [class*="answer"]').first().text().trim();
                
                if (question && answer && question.length > 10 && answer.length > 20) {
                    faqs.push({ question, answer });
                }
            });
        });
        
        return faqs;
    }

    extractContactInfo($) {
        const contact = {};
        
        // Extract email addresses
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const bodyText = $('body').text();
        const emails = bodyText.match(emailRegex) || [];
        if (emails.length > 0) contact.emails = [...new Set(emails)];
        
        // Extract phone numbers
        const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
        const phones = bodyText.match(phoneRegex) || [];
        if (phones.length > 0) contact.phones = [...new Set(phones)];
        
        // Extract address
        const addressKeywords = ['address', 'location', 'office'];
        addressKeywords.forEach(keyword => {
            $(`[class*="${keyword}"], [id*="${keyword}"]`).each((i, el) => {
                const text = $(el).text().trim();
                if (text && text.length > 20 && !contact.address) {
                    contact.address = text;
                }
            });
        });
        
        return contact;
    }

    extractFeatures($) {
        const features = [];
        
        // Look for feature sections
        const featureSelectors = [
            '.feature', '.service', '.benefit', '.capability',
            '[class*="feature"]', '[class*="service"]', '[class*="benefit"]'
        ];
        
        featureSelectors.forEach(selector => {
            $(selector).each((i, el) => {
                const title = $(el).find('h1, h2, h3, h4, h5, h6').first().text().trim();
                const description = $(el).find('p').first().text().trim();
                
                if (title && description && title.length > 3 && description.length > 20) {
                    features.push({ title, description });
                }
            });
        });
        
        return features;
    }

    extractNavigation($) {
        const navigation = [];
        
        $('nav a, .navigation a, .menu a, header a').each((i, el) => {
            const text = $(el).text().trim();
            const href = $(el).attr('href');
            
            if (text && href && text.length > 1) {
                navigation.push({ text, href });
            }
        });
        
        return navigation;
    }

    extractLinks($, baseUrl) {
        const links = [];
        const base = new URL(baseUrl);
        
        $('a[href]').each((i, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().trim();
            
            if (href && text) {
                try {
                    const url = new URL(href, baseUrl);
                    if (url.hostname === base.hostname) {
                        links.push({ text, url: url.href });
                    }
                } catch (e) {
                    // Invalid URL, skip
                }
            }
        });
        
        return links;
    }

    extractImages($, baseUrl) {
        const images = [];
        
        $('img[src]').each((i, el) => {
            const src = $(el).attr('src');
            const alt = $(el).attr('alt') || '';
            
            if (src) {
                try {
                    const url = new URL(src, baseUrl);
                    images.push({ src: url.href, alt });
                } catch (e) {
                    // Invalid URL, skip
                }
            }
        });
        
        return images;
    }

    extractForms($) {
        const forms = [];
        
        $('form').each((i, el) => {
            const action = $(el).attr('action') || '';
            const method = $(el).attr('method') || 'GET';
            const inputs = [];
            
            $(el).find('input, select, textarea').each((j, input) => {
                const type = $(input).attr('type') || $(input).prop('tagName').toLowerCase();
                const name = $(input).attr('name') || '';
                const placeholder = $(input).attr('placeholder') || '';
                const label = $(input).closest('label').text().trim() || 
                             $(input).siblings('label').text().trim() ||
                             $(input).prev('label').text().trim();
                
                if (name) {
                    inputs.push({ type, name, placeholder, label });
                }
            });
            
            if (inputs.length > 0) {
                forms.push({ action, method, inputs });
            }
        });
        
        return forms;
    }

    getElementContext(element) {
        const parent = element.parent();
        const parentClass = parent.attr('class') || '';
        const parentId = parent.attr('id') || '';
        
        return {
            parentTag: parent.prop('tagName')?.toLowerCase() || '',
            parentClass,
            parentId,
            section: this.findSectionContext(element)
        };
    }

    findSectionContext(element) {
        const sectionElement = element.closest('section, article, div[class*="section"], div[class*="content"]');
        if (sectionElement.length > 0) {
            const heading = sectionElement.find('h1, h2, h3, h4, h5, h6').first().text().trim();
            if (heading) return heading;
        }
        return '';
    }

    findImportantPages(mainPageData, baseUrl) {
        const importantPages = [];
        const importantKeywords = [
            'about', 'contact', 'services', 'products', 'features', 'pricing', 
            'support', 'help', 'faq', 'documentation', 'docs', 'team'
        ];
        
        if (mainPageData.navigation) {
            mainPageData.navigation.forEach(nav => {
                const text = nav.text.toLowerCase();
                const href = nav.href;
                
                if (importantKeywords.some(keyword => text.includes(keyword))) {
                    try {
                        const url = new URL(href, baseUrl);
                        if (url.hostname === new URL(baseUrl).hostname) {
                            importantPages.push(url.href);
                        }
                    } catch (e) {
                        // Invalid URL, skip
                    }
                }
            });
        }
        
        return [...new Set(importantPages)]; // Remove duplicates
    }

    async scrapeMultiplePages(urls) {
        const results = [];
        
        for (const url of urls) {
            try {
                const pageData = await this.scrapePage(url);
                if (pageData) {
                    results.push(pageData);
                }
                await this.delay(1000); // Be respectful with delays
            } catch (error) {
                console.warn(`Failed to scrape ${url}:`, error.message);
            }
        }
        
        return results;
    }

    processContentForTraining(pagesData) {
        const trainingData = [];
        
        pagesData.forEach(pageData => {
            if (!pageData) return;
            
            // Process FAQs
            if (pageData.faqs && pageData.faqs.length > 0) {
                pageData.faqs.forEach(faq => {
                    trainingData.push({
                        type: 'faq',
                        input: faq.question,
                        output: faq.answer,
                        source: pageData.url,
                        confidence: 0.9
                    });
                });
            }
            
            // Process features as capabilities
            if (pageData.features && pageData.features.length > 0) {
                pageData.features.forEach(feature => {
                    trainingData.push({
                        type: 'feature',
                        input: `What is ${feature.title}?`,
                        output: feature.description,
                        source: pageData.url,
                        confidence: 0.7
                    });
                    
                    trainingData.push({
                        type: 'feature',
                        input: `Tell me about ${feature.title}`,
                        output: feature.description,
                        source: pageData.url,
                        confidence: 0.7
                    });
                });
            }
            
            // Process general content
            if (pageData.content && pageData.content.length > 0) {
                pageData.content.forEach(content => {
                    if (content.type === 'paragraph' && content.text.length > 50) {
                        // Create training data from paragraphs
                        const sentences = content.text.split(/[.!?]+/).filter(s => s.trim().length > 20);
                        if (sentences.length >= 2) {
                            trainingData.push({
                                type: 'content',
                                input: `Tell me about ${content.context.section || pageData.title}`,
                                output: content.text,
                                source: pageData.url,
                                confidence: 0.5
                            });
                        }
                    }
                });
            }
            
            // Process contact information
            if (pageData.contactInfo && Object.keys(pageData.contactInfo).length > 0) {
                const contact = pageData.contactInfo;
                
                if (contact.emails && contact.emails.length > 0) {
                    trainingData.push({
                        type: 'contact',
                        input: 'What is your email address?',
                        output: `You can reach us at ${contact.emails[0]}`,
                        source: pageData.url,
                        confidence: 0.9
                    });
                }
                
                if (contact.phones && contact.phones.length > 0) {
                    trainingData.push({
                        type: 'contact',
                        input: 'What is your phone number?',
                        output: `You can call us at ${contact.phones[0]}`,
                        source: pageData.url,
                        confidence: 0.9
                    });
                }
                
                if (contact.address) {
                    trainingData.push({
                        type: 'contact',
                        input: 'What is your address?',
                        output: `Our address is: ${contact.address}`,
                        source: pageData.url,
                        confidence: 0.9
                    });
                }
            }
        });
        
        return trainingData;
    }

    generateChatbotConfig(trainingData, mainPageData) {
        const config = {
            name: mainPageData.title || 'Website Assistant',
            description: mainPageData.metaDescription || 'I can help you with information about this website.',
            personality: {
                tone: 'friendly',
                style: 'professional',
                helpfulness: 'high'
            },
            capabilities: [],
            responses: {
                greeting: `Hello! I'm here to help you with any questions about ${mainPageData.title || 'our website'}. What can I assist you with?`,
                fallback: "I'm sorry, I don't have information about that specific topic. Is there something else I can help you with?",
                goodbye: "Thank you for visiting! If you have any other questions, feel free to ask."
            },
            knowledge: {
                trainingDataCount: trainingData.length,
                topics: [...new Set(trainingData.map(item => item.type))],
                sources: [...new Set(trainingData.map(item => item.source))]
            },
            settings: {
                maxResponseLength: 500,
                confidenceThreshold: 0.5,
                enableFallback: true,
                enableGreeting: true
            }
        };
        
        // Determine capabilities based on training data
        const topicCounts = {};
        trainingData.forEach(item => {
            topicCounts[item.type] = (topicCounts[item.type] || 0) + 1;
        });
        
        Object.entries(topicCounts).forEach(([topic, count]) => {
            if (count > 2) { // Only include topics with sufficient data
                config.capabilities.push({
                    name: topic.charAt(0).toUpperCase() + topic.slice(1),
                    description: `Answer questions about ${topic}`,
                    dataPoints: count
                });
            }
        });
        
        return config;
    }

    async scrapePage(url) {
        try {
            const response = await axios.get(url, { 
                headers: this.headers,
                timeout: 15000
            });
            
            const $ = cheerio.load(response.data);
            
            const pageData = {
                url,
                title: $('title').text().trim(),
                description: $('meta[name="description"]').attr('content') || '',
                content: this.extractContent($),
                
                // Navigation & Structure
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

    extractContent($) {
        const content = [];
        
        // Extract main content areas
        $('main, .main-content, .content, article, .post-content, .page-content').each((i, el) => {
            const $el = $(el);
            const text = $el.text().trim();
            if (text.length > 50) {
                content.push({
                    text: text,
                    selector: el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ').join('.') : ''),
                    length: text.length
                });
            }
        });

        // Extract paragraphs if no main content found
        if (content.length === 0) {
            $('p').each((i, el) => {
                const text = $(el).text().trim();
                if (text.length > 30) {
                    content.push({
                        text: text,
                        selector: 'p',
                        length: text.length
                    });
                }
            });
        }

        return content;
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
module.exports = WebsiteChatbotScraper;

// Run if called directly
if (require.main === module) {
    const scraper = new WebsiteChatbotScraper();
    scraper.scrapeFullSite().catch(console.error);
}
