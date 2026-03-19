export interface BlogPost {
  id: number;
  title: string;
  category: "Product" | "Growth" | "Strategy";
  excerpt: string;
  content: string;
  author?: string;
  date: string;
  isFeatured?: boolean;
}

export const categoryColors = {
  Product: "purple",
  Growth: "blue",
  Strategy: "cyan",
};

export const posts: BlogPost[] = [
  {
    id: 1,
    isFeatured: true,
    title: "How We Built Brand DNA: The AI Behind Your Instagram Strategy",
    category: "Product",
    excerpt: "Deep dive into the machine learning models that analyze your brand aesthetics and audience sentiment to create the perfect content strategy.",
    content: "Our Brand DNA engine is the heart of Plug and Play Agent. It uses advanced computer vision to understand your visual style and natural language processing to grasp your brand's unique voice. By analyzing hundreds of data points from your top-performing posts, it builds a comprehensive profile that guides all future content generation. This ensures that every Reel and Carousel we generate feels authentically yours while being optimized for maximum engagement.",
    author: "Plug and Play Team",
    date: "March 10, 2026",
  },
  {
    id: 2,
    title: "7 Instagram Growth Mistakes You're Probably Making",
    category: "Growth",
    excerpt: "From inconsistent posting to ignoring engagement metrics, here are the top pitfalls to avoid if you want to scale in 2026.",
    content: "The most common mistake we see is 'shadow-chasing' — trying to replicate viral trends that don't align with your brand DNA. Other major errors include neglecting your Story strategy, failing to optimize for the first 3 seconds of a Reel, and ignoring the power of SEO-friendly captions. In this post, we break down each mistake and provide actionable solutions to get your growth back on track.",
    date: "March 3, 2026",
  },
  {
    id: 4,
    title: "What's New in Plug and Play Agent v2.4",
    category: "Product",
    excerpt: "Discover the latest features, including the new Support portal, enhanced Carousel generation, and faster Brand DNA analysis.",
    content: "Version 2.4 brings significant performance improvements. Our Brand DNA analysis is now 40% faster, and the new Carousel generator includes 5 new professional templates. We've also launched our comprehensive Support portal to help you master every feature of the platform. Check out the full changelog to see everything we've updated in this milestone release.",
    date: "March 1, 2026",
  },
  {
    id: 3,
    title: "Why Consistency Beats Virality Every Time",
    category: "Strategy",
    excerpt: "Building a sustainable audience requires trust, which only comes from showing up every day with high-quality content that resonates.",
    content: "One viral hit might get you followers, but consistency keeps them. The Instagram algorithm rewards accounts that keep users on the platform regularly. By posting consistent, high-value content, you build a habit with your audience. They begin to look for your posts, engage more frequently, and eventually transition from passive followers to loyal brand advocates.",
    date: "Feb 24, 2026",
  },
  {
    id: 5,
    title: "How to Write Captions That Actually Convert",
    category: "Growth",
    excerpt: "Stop writing boring captions. Learn the hook-body-CTA framework that turns passive viewers into active followers.",
    content: "Your caption is the second most important part of your post after the visual. A great caption should start with a 'Scroll Stopper' hook, provide value or storytelling in the body, and always end with a clear Call to Action (CTA). Whether you want more comments, website visits, or saves, your caption is where you make the ask and drive the result.",
    date: "Feb 15, 2026",
  },
  {
    id: 6,
    title: "The Science of Optimal Posting Times",
    category: "Strategy",
    excerpt: "We analyzed 1 million posts to find out exactly when your audience is most active and ready to engage with your content.",
    content: "There is no single 'best time' for everyone. The optimal time depends on your specific audience's timezone and app usage patterns. However, our data shows clear peaks during morning commutes, lunch breaks, and late evenings. We'll show you how to use your built-in analytics combined with our AI insights to nail your timing every single day.",
    date: "Feb 8, 2026",
  },
  {
    id: 7,
    title: "Creator vs. Business Account: Which One Should You Use?",
    category: "Growth",
    excerpt: "Understand the critical differences in analytics, music rights, and advertising features to make the right choice for your brand.",
    content: "Choosing the wrong account type can limit your reach or access to viral audio. Creator accounts are perfect for individuals and influencers who need access to the full music library, while Business accounts offer enhanced API access and professional contact buttons. We compare both in depth to help you decide which one aligns with your monetization and growth goals.",
    date: "Jan 30, 2026",
  },
];