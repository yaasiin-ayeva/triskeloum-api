import logger from "../config/logger.config";
import { Quote } from "../models/Quote.model";
import QuoteService from "../services/Quote.service";

const seedQuotes = async () => {

    const quoteService = new QuoteService();
    try {

        const quotes: Quote[] = [
            new Quote({ cover: 'https://picsum.photos/207', content: 'Success is not final, failure is not fatal: It is the courage to continue that counts.', author: 'Winston Churchill' }),
            new Quote({ cover: 'https://picsum.photos/208', content: 'Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.', author: 'Buddha' }),
            new Quote({ cover: 'https://picsum.photos/209', content: 'The purpose of our lives is to be happy.', author: 'Dalai Lama' }),
            new Quote({ cover: 'https://picsum.photos/210', content: 'Life is what happens when you’re busy making other plans.', author: 'John Lennon' }),
            new Quote({ cover: 'https://picsum.photos/211', content: 'Get busy living or get busy dying.', author: 'Stephen King' }),
            new Quote({ cover: 'https://picsum.photos/212', content: 'You have within you right now, everything you need to deal with whatever the world can throw at you.', author: 'Brian Tracy' }),
            new Quote({ cover: 'https://picsum.photos/213', content: 'Believe you can and you’re halfway there.', author: 'Theodore Roosevelt' }),
            new Quote({ cover: 'https://picsum.photos/214', content: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' }),
            new Quote({ cover: 'https://picsum.photos/215', content: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' }),
            new Quote({ cover: 'https://picsum.photos/216', content: 'Happiness is not something ready made. It comes from your own actions.', author: 'Dalai Lama' }),
            new Quote({ cover: 'https://picsum.photos/217', content: 'In the middle of every difficulty lies opportunity.', author: 'Albert Einstein' }),
            new Quote({ cover: 'https://picsum.photos/218', content: 'Turn your wounds into wisdom.', author: 'Oprah Winfrey' }),
            new Quote({ cover: 'https://picsum.photos/219', content: 'It is never too late to be what you might have been.', author: 'George Eliot' }),
            new Quote({ cover: 'https://picsum.photos/220', content: 'Everything you can imagine is real.', author: 'Pablo Picasso' }),
            new Quote({ cover: 'https://picsum.photos/221', content: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.', author: 'Ralph Waldo Emerson' }),
            new Quote({ cover: 'https://picsum.photos/222', content: 'Do not go where the path may lead, go instead where there is no path and leave a trail.', author: 'Ralph Waldo Emerson' }),
            new Quote({ cover: 'https://picsum.photos/223', content: 'You miss 100% of the shots you don’t take.', author: 'Wayne Gretzky' }),
            new Quote({ cover: 'https://picsum.photos/224', content: 'I have not failed. I’ve just found 10,000 ways that won’t work.', author: 'Thomas Edison' }),
            new Quote({ cover: 'https://picsum.photos/225', content: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' }),
            new Quote({ cover: 'https://picsum.photos/226', content: 'Whether you think you can or you think you can’t, you’re right.', author: 'Henry Ford' }),
        ];

        for (const quote of quotes) {
            const existingQuote = await quoteService.findOneByName(quote.content, 'content');
            if (!existingQuote) {
                await quote.save();
            }
        }

    } catch (error) {
        logger.error('Error seeding quotes:', error);
    }
};

export default seedQuotes;