export interface DataSource {
  id: string;
  name: string;
  category: string;
  icon: string;
  url: string;
  thumbnail: string;
  description: string;
  hasAPI: boolean;
  requiresAuth: boolean;
  scrapeMethod: 'rss' | 'api' | 'html' | 'headless';
  popularity: number;
}

export const CATEGORIES: Record<string, { icon: string; color: string }> = {
  'AI技术': { icon: '🤖', color: '#6366f1' },
  '开发者社区': { icon: '💻', color: '#3b82f6' },
  '科技媒体': { icon: '📰', color: '#10b981' },
  '社交媒体': { icon: '📱', color: '#ec4899' },
  '视频平台': { icon: '🎬', color: '#ef4444' },
  '设计创意': { icon: '🎨', color: '#f59e0b' },
  '学术研究': { icon: '🔬', color: '#8b5cf6' },
  '产品资讯': { icon: '🚀', color: '#06b6d4' },
  '商业财经': { icon: '💰', color: '#14b8a6' },
  '综合资讯': { icon: '🌐', color: '#64748b' },
};

export const DATA_SOURCES: DataSource[] = [
  { id: 'huggingface', name: 'Hugging Face', category: 'AI技术', icon: '🤗', url: 'https://huggingface.co', thumbnail: 'https://huggingface.co/front/thumbnails/moon.png', description: '领先的AI模型社区', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 10 },
  { id: 'paperswithcode', name: 'Papers With Code', category: 'AI技术', icon: '📄', url: 'https://paperswithcode.com', thumbnail: 'https://paperswithcode.com/static/images/logo.png', description: 'AI论文与代码', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 9 },
  { id: 'arxiv', name: 'arXiv', category: 'AI技术', icon: '📚', url: 'https://arxiv.org', thumbnail: 'https://static.arxiv.org/static/base/images/arxiv-logo-web.svg', description: 'AI预印本论文', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 10 },
  { id: 'openai', name: 'OpenAI Blog', category: 'AI技术', icon: '🧠', url: 'https://openai.com/blog', thumbnail: 'https://openai.com/favicon.ico', description: 'OpenAI官方博客', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 10 },
  { id: 'googleai', name: 'Google AI Blog', category: 'AI技术', icon: '🔵', url: 'https://blog.google/technology/ai/', thumbnail: 'https://www.gstatic.com/images/icons/material/system/1x/google_color_48dp.png', description: 'Google AI研究', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 9 },
  { id: 'metaai', name: 'Meta AI Research', category: 'AI技术', icon: '🔷', url: 'https://ai.meta.com/blog/', thumbnail: 'https://static.xx.fbcdn.net/rsrc.php/v3/yG/r/aA0pzX3xVpR.png', description: 'Meta人工智能研究', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 8 },
  { id: 'microsoftai', name: 'Microsoft AI', category: 'AI技术', icon: '🪟', url: 'https://news.microsoft.com/source/topics/ai/', thumbnail: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b', description: '微软AI资讯', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 8 },
  { id: 'anthropic', name: 'Anthropic', category: 'AI技术', icon: '🟣', url: 'https://www.anthropic.com/news', thumbnail: 'https://www.anthropic.com/images/favicon.ico', description: 'Claude制造商新闻', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 9 },
  { id: 'deepmind', name: 'DeepMind Blog', category: 'AI技术', icon: '🧪', url: 'https://deepmind.google/discover/blog/', thumbnail: 'https://deepmind.google/static/images/favicon.ico', description: 'DeepMind研究博客', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 9 },
  { id: 'nvidia', name: 'NVIDIA Tech Blog', category: 'AI技术', icon: '🟢', url: 'https://developer.nvidia.com/blog/', thumbnail: 'https://developer.nvidia.com/sites/default/files/favicon.ico', description: 'GPU与AI技术', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 8 },
  { id: 'stabilityai', name: 'Stability AI', category: 'AI技术', icon: '🎭', url: 'https://stability.ai/news', thumbnail: 'https://stability.ai/favicon.ico', description: 'Stable Diffusion开发商', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 8 },
  { id: 'midjourney', name: 'Midjourney', category: 'AI技术', icon: '🖼️', url: 'https://www.midjourney.com', thumbnail: 'https://www.midjourney.com/favicon.ico', description: 'AI图像生成工具', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 10 },
  { id: 'runwayml', name: 'Runway ML', category: 'AI技术', icon: '🎥', url: 'https://runwayml.com/blog/', thumbnail: 'https://runwayml.com/favicon.ico', description: 'AI视频创作工具', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 8 },
  { id: 'civitai', name: 'Civitai', category: 'AI技术', icon: '🏛️', url: 'https://civitai.com', thumbnail: 'https://civitai.com/favicon.ico', description: 'Stable Diffusion模型社区', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 9 },
  { id: 'replicate', name: 'Replicate', category: 'AI技术', icon: '🔄', url: 'https://replicate.com/explore', thumbnail: 'https://replicate.com/favicon.ico', description: 'AI模型运行平台', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 7 },

  { id: 'github', name: 'GitHub Trending', category: '开发者社区', icon: '🐙', url: 'https://github.com/trending', thumbnail: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', description: '代码仓库趋势', hasAPI: true, requiresAuth: false, scrapeMethod: 'html', popularity: 10 },
  { id: 'stackoverflow', name: 'Stack Overflow', category: '开发者社区', icon: '📋', url: 'https://stackoverflow.com', thumbnail: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico', description: '开发者问答社区', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 9 },
  { id: 'devto', name: 'DEV Community', category: '开发者社区', icon: '👨‍💻', url: 'https://dev.to', thumbnail: 'https://dev.to/favicon.ico', description: '开发者技术博客', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 8 },
  { id: 'hackernews', name: 'Hacker News', category: '开发者社区', icon: '🟠', url: 'https://news.ycombinator.com', thumbnail: 'https://news.ycombinator.com/favicon.ico', description: '科技创业资讯', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 10 },
  { id: 'producthunt', name: 'Product Hunt', category: '开发者社区', icon: '🦄', url: 'https://www.producthunt.com', thumbnail: 'https://www.producthunt.com/favicon.ico', description: '新产品发布平台', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 9 },
  { id: 'reddit', name: 'Reddit', category: '开发者社区', icon: '🤖', url: 'https://www.reddit.com', thumbnail: 'https://www.redditstatic.com/shreddit/assets/favicon/192.png', description: '综合社区论坛', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 10 },
  { id: 'medium', name: 'Medium', category: '开发者社区', icon: '📝', url: 'https://medium.com', thumbnail: 'https://medium.com/favicon.ico', description: '技术博客平台', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 8 },
  { id: 'hashnode', name: 'Hashnode', category: '开发者社区', icon: '📓', url: 'https://hashnode.com', thumbnail: 'https://cdn.hashnode.com/res/hashnode/image/upload/v1611242155728/W3_ByVVWE.png', description: '开发者博客社区', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 7 },
  { id: 'dzone', name: 'DZone', category: '开发者社区', icon: '📡', url: 'https://dzone.com', thumbnail: 'https://dz2cdn1.dzone.com/static/img/logos/dzone-logo.png', description: '开发者资讯中心', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 6 },
  { id: 'infoq', name: 'InfoQ', category: '开发者社区', icon: '💡', url: 'https://www.infoq.com', thumbnail: 'https://www.infoq.com/favicon.ico', description: '企业软件开发资讯', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 7 },
  { id: 'freecodecamp', name: 'freeCodeCamp', category: '开发者社区', icon: '🏕️', url: 'https://www.freecodecamp.org/news/', thumbnail: 'https://www.freecodecamp.org/icons/icon-48x48.png', description: '编程学习资讯', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 8 },
  { id: 'smashingmagazine', name: 'Smashing Magazine', category: '开发者社区', icon: '💎', url: 'https://www.smashingmagazine.com', thumbnail: 'https://www.smashingmagazine.com/images/favicon.png', description: 'Web设计开发杂志', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 7 },
  { id: 'csstricks', name: 'CSS-Tricks', category: '开发者社区', icon: '🎨', url: 'https://css-tricks.com', thumbnail: 'https://css-tricks.com/favicon.ico', description: 'CSS技术博客', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 7 },
  { id: 'sitepoint', name: 'SitePoint', category: '开发者社区', icon: '🌐', url: 'https://www.sitepoint.com', thumbnail: 'https://www.sitepoint.com/favicon.ico', description: 'Web开发教程资讯', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 6 },
  { id: 'opensource', name: 'opensource.com', category: '开发者社区', icon: '📦', url: 'https://opensource.com', thumbnail: 'https://opensource.com/sites/default/files/favicon.ico', description: '开源软件资讯', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 6 },

  { id: 'techcrunch', name: 'TechCrunch', category: '科技媒体', icon: '🔵', url: 'https://techcrunch.com', thumbnail: 'https://techcrunch.com/wp-content/uploads/2021/01/cropped-cropped-favicon-192x192.png', description: '科技创业资讯', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 9 },
  { id: 'theverge', name: 'The Verge', category: '科技媒体', icon: '🔴', url: 'https://www.theverge.com', thumbnail: 'https://www.theverge.com/icons/icon-512x512.png', description: '科技新闻与评测', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 9 },
  { id: 'wired', name: 'WIRED', category: '科技媒体', icon: '⚡', url: 'https://www.wired.com', thumbnail: 'https://www.wired.com/favicon.ico', description: '科技与文化杂志', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 8 },
  { id: 'arstechnica', name: 'Ars Technica', category: '科技媒体', icon: '🔬', url: 'https://arstechnica.com', thumbnail: 'https://cdn.arstechnica.net/wp-content/uploads/2021/07/cropped-ARFavicon-192x192.png', description: '深度科技资讯', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 8 },
  { id: 'engadget', name: 'Engadget', category: '科技媒体', icon: '📺', url: 'https://www.engadget.com', thumbnail: 'https://www.engadget.com/favicon.ico', description: '消费电子产品资讯', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 7 },
  { id: 'cnet', name: 'CNET', category: '科技媒体', icon: '🌟', url: 'https://www.cnet.com', thumbnail: 'https://www.cnet.com/favicon.ico', description: '科技产品评测', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 7 },
  { id: 'mashable', name: 'Mashable', category: '科技媒体', icon: '💬', url: 'https://mashable.com', thumbnail: 'https://mashable.com/favicon.ico', description: '数字文化媒体', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 7 },
  { id: 'venturebeat', name: 'VentureBeat', category: '科技媒体', icon: '🚀', url: 'https://venturebeat.com', thumbnail: 'https://venturebeat.com/favicon.ico', description: '科技商业资讯', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 7 },
  { id: 'zdnet', name: 'ZDNet', category: '科技媒体', icon: '🔵', url: 'https://www.zdnet.com', thumbnail: 'https://www.zdnet.com/favicon.ico', description: '企业科技资讯', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 7 },
  { id: 'gizmodo', name: 'Gizmodo', category: '科技媒体', icon: '🟡', url: 'https://gizmodo.com', thumbnail: 'https://gizmodo.com/favicon.ico', description: '设计科技博客', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 6 },
  { id: 'thenextweb', name: 'The Next Web', category: '科技媒体', icon: '🌐', url: 'https://thenextweb.com', thumbnail: 'https://thenextweb.com/favicon.ico', description: '全球科技资讯', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 7 },
  { id: 'techradar', name: 'TechRadar', category: '科技媒体', icon: '📡', url: 'https://www.techradar.com', thumbnail: 'https://www.techradar.com/favicon.ico', description: '科技评测与新闻', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 7 },
  { id: 'tomshardware', name: "Tom's Hardware", category: '科技媒体', icon: '🔧', url: 'https://www.tomshardware.com', thumbnail: 'https://www.tomshardware.com/favicon.ico', description: '硬件评测资讯', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 7 },
  { id: 'pcmag', name: 'PCMag', category: '科技媒体', icon: '💻', url: 'https://www.pcmag.com', thumbnail: 'https://www.pcmag.com/favicon.ico', description: '电脑产品评测', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 6 },
  { id: '9to5mac', name: '9to5Mac', category: '科技媒体', icon: '🍎', url: 'https://9to5mac.com', thumbnail: 'https://9to5mac.com/favicon.ico', description: 'Apple生态系统资讯', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 8 },

  { id: 'twitter', name: 'Twitter/X', category: '社交媒体', icon: '🐦', url: 'https://twitter.com', thumbnail: 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png', description: '实时热点资讯', hasAPI: true, requiresAuth: true, scrapeMethod: 'html', popularity: 10 },
  { id: 'weibo', name: '微博', category: '社交媒体', icon: '📝', url: 'https://weibo.com', thumbnail: 'https://weibo.com/favicon.ico', description: '中国最大社交媒体', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 10 },
  { id: 'zhihu', name: '知乎', category: '社交媒体', icon: '💡', url: 'https://www.zhihu.com', thumbnail: 'https://static.zhihu.com/heifetz/favicon.ico', description: '中文问答社区', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 9 },
  { id: 'xiaohongshu', name: '小红书', category: '社交媒体', icon: '📕', url: 'https://www.xiaohongshu.com', thumbnail: 'https://www.xiaohongshu.com/favicon.ico', description: '生活方式分享平台', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 9 },
  { id: 'douyin', name: '抖音', category: '社交媒体', icon: '🎵', url: 'https://www.douyin.com', thumbnail: 'https://www.douyin.com/favicon.ico', description: '短视频平台', hasAPI: false, requiresAuth: false, scrapeMethod: 'headless', popularity: 10 },
  { id: 'tiktok', name: 'TikTok', category: '社交媒体', icon: '🎶', url: 'https://www.tiktok.com', thumbnail: 'https://www.tiktok.com/favicon.ico', description: '国际短视频平台', hasAPI: true, requiresAuth: false, scrapeMethod: 'html', popularity: 10 },
  { id: 'bilibili', name: 'Bilibili', category: '社交媒体', icon: '📺', url: 'https://www.bilibili.com', thumbnail: 'https://www.bilibili.com/favicon.ico', description: '中国视频社区', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 9 },
  { id: 'instagram', name: 'Instagram', category: '社交媒体', icon: '📸', url: 'https://www.instagram.com', thumbnail: 'https://www.instagram.com/static/images/ico/favicon.ico', description: '图片分享社交', hasAPI: true, requiresAuth: true, scrapeMethod: 'api', popularity: 9 },
  { id: 'linkedin', name: 'LinkedIn', category: '社交媒体', icon: '💼', url: 'https://www.linkedin.com', thumbnail: 'https://static.licdn.com/sc/h/8fkga714vy9b2wk5auqo5refb', description: '职场社交平台', hasAPI: true, requiresAuth: true, scrapeMethod: 'api', popularity: 8 },
  { id: 'discord', name: 'Discord', category: '社交媒体', icon: '🎮', url: 'https://discord.com', thumbnail: 'https://discord.com/assets/favicon.ico', description: '社群聊天平台', hasAPI: true, requiresAuth: true, scrapeMethod: 'api', popularity: 8 },

  { id: 'youtube', name: 'YouTube', category: '视频平台', icon: '▶️', url: 'https://www.youtube.com', thumbnail: 'https://www.youtube.com/s/desktop/img/favicon_144x144.png', description: '全球最大视频平台', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 10 },
  { id: 'twitch', name: 'Twitch', category: '视频平台', icon: '🎮', url: 'https://www.twitch.tv', thumbnail: 'https://static.twitchcdn.net/assets/favicon-32x32.png', description: '游戏直播平台', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 8 },
  { id: 'vimeo', name: 'Vimeo', category: '视频平台', icon: '🎬', url: 'https://vimeo.com', thumbnail: 'https://vimeo.com/favicon.ico', description: '高清视频分享', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 6 },
  { id: 'dailymotion', name: 'Dailymotion', category: '视频平台', icon: '📹', url: 'https://www.dailymotion.com', thumbnail: 'https://www.dailymotion.com/favicon.ico', description: '法国视频平台', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 5 },
  { id: 'iqiyi', name: '爱奇艺', category: '视频平台', icon: '🟢', url: 'https://www.iqiyi.com', thumbnail: 'https://www.iqiyi.com/favicon.ico', description: '中国视频平台', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 8 },
  { id: 'tencentvideo', name: '腾讯视频', category: '视频平台', icon: '🔵', url: 'https://v.qq.com', thumbnail: 'https://v.qq.com/favicon.ico', description: '腾讯视频平台', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 8 },
  { id: 'youku', name: '优酷', category: '视频平台', icon: '🔴', url: 'https://www.youku.com', thumbnail: 'https://www.youku.com/favicon.ico', description: '阿里巴巴视频平台', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 7 },
  { id: 'kuaishou', name: '快手', category: '视频平台', icon: '🟣', url: 'https://www.kuaishou.com', thumbnail: 'https://www.kuaishou.com/favicon.ico', description: '短视频社交平台', hasAPI: false, requiresAuth: false, scrapeMethod: 'headless', popularity: 8 },
  { id: 'xigua', name: '西瓜视频', category: '视频平台', icon: '🍉', url: 'https://www.ixigua.com', thumbnail: 'https://www.ixigua.com/favicon.ico', description: '字节跳动视频平台', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 7 },
  { id: 'acfun', name: 'AcFun', category: '视频平台', icon: '🅰️', url: 'https://www.acfun.cn', thumbnail: 'https://www.acfun.cn/favicon.ico', description: '中国弹幕视频站', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 6 },

  { id: 'dribbble', name: 'Dribbble', category: '设计创意', icon: '🏀', url: 'https://dribbble.com', thumbnail: 'https://cdn.dribbble.com/assets/favicon.png', description: '设计师作品展示', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 8 },
  { id: 'behance', name: 'Behance', category: '设计创意', icon: '🅱️', url: 'https://www.behance.net', thumbnail: 'https://a5.behance.net/favicon.ico', description: 'Adobe设计社区', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 8 },
  { id: 'figma', name: 'Figma Community', category: '设计创意', icon: '🎨', url: 'https://www.figma.com/community', thumbnail: 'https://static.figma.com/app/icon/1/favicon.png', description: '设计工具社区', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 9 },
  { id: 'unsplash', name: 'Unsplash', category: '设计创意', icon: '📷', url: 'https://unsplash.com', thumbnail: 'https://unsplash.com/favicon.ico', description: '免费高质量图片', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 8 },
  { id: 'pexels', name: 'Pexels', category: '设计创意', icon: '🖼️', url: 'https://www.pexels.com', thumbnail: 'https://www.pexels.com/assets/favicon.ico', description: '免费素材图片视频', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 7 },
  { id: 'pixabay', name: 'Pixabay', category: '设计创意', icon: '📸', url: 'https://pixabay.com', thumbnail: 'https://pixabay.com/favicon.ico', description: '免费图片视频音乐', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 7 },
  { id: 'artstation', name: 'ArtStation', category: '设计创意', icon: '🎭', url: 'https://www.artstation.com', thumbnail: 'https://www.artstation.com/favicon.ico', description: '数字艺术平台', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 7 },
  { id: 'deviantart', name: 'DeviantArt', category: '设计创意', icon: '🎨', url: 'https://www.deviantart.com', thumbnail: 'https://www.deviantart.com/favicon.ico', description: '艺术家社区', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 6 },
  { id: 'canva', name: 'Canva', category: '设计创意', icon: '🌈', url: 'https://www.canva.com', thumbnail: 'https://static.canva.com/static/images/favicon.ico', description: '在线设计工具', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 8 },
  { id: 'ui8', name: 'UI8', category: '设计创意', icon: '🎯', url: 'https://ui8.net', thumbnail: 'https://ui8.net/favicon.ico', description: 'UI设计资源', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 6 },

  { id: 'googlescholar', name: 'Google Scholar', category: '学术研究', icon: '🎓', url: 'https://scholar.google.com', thumbnail: 'https://ssl.gstatic.com/scholar/favicon.ico', description: '学术搜索引擎', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 9 },
  { id: 'semanticscholar', name: 'Semantic Scholar', category: '学术研究', icon: '🔍', url: 'https://www.semanticscholar.org', thumbnail: 'https://www.semanticscholar.org/favicon.ico', description: 'AI驱动的学术搜索', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 8 },
  { id: 'academia', name: 'Academia.edu', category: '学术研究', icon: '📚', url: 'https://www.academia.edu', thumbnail: 'https://www.academia.edu/favicon.ico', description: '学术分享平台', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 7 },
  { id: 'researchgate', name: 'ResearchGate', category: '学术研究', icon: '🔬', url: 'https://www.researchgate.net', thumbnail: 'https://www.researchgate.net/images/favicon.png', description: '科研人员社区', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 7 },
  { id: 'mitnews', name: 'MIT News', category: '学术研究', icon: '🏛️', url: 'https://news.mit.edu', thumbnail: 'https://news.mit.edu/favicon.ico', description: 'MIT新闻', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 8 },

  { id: 'producthunt2', name: 'Product Hunt', category: '产品资讯', icon: '🦄', url: 'https://www.producthunt.com', thumbnail: 'https://www.producthunt.com/favicon.ico', description: '新产品发布', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 9 },
  { id: 'alternativeto', name: 'AlternativeTo', category: '产品资讯', icon: '🔄', url: 'https://alternativeto.net', thumbnail: 'https://alternativeto.net/favicon.ico', description: '软件替代方案', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 6 },
  { id: 'saasworthy', name: 'SaaSworthy', category: '产品资讯', icon: '☁️', url: 'https://www.saasworthy.com', thumbnail: 'https://www.saasworthy.com/favicon.ico', description: 'SaaS软件评测', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 5 },
  { id: 'betalist', name: 'BetaList', category: '产品资讯', icon: '🧪', url: 'https://betalist.com', thumbnail: 'https://betalist.com/favicon.ico', description: '早期创业项目', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 6 },
  { id: 'kickstarter', name: 'Kickstarter', category: '产品资讯', icon: '🚀', url: 'https://www.kickstarter.com', thumbnail: 'https://www.kickstarter.com/favicon.ico', description: '众筹平台', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 7 },
  { id: 'indiegogo', name: 'Indiegogo', category: '产品资讯', icon: '💡', url: 'https://www.indiegogo.com', thumbnail: 'https://www.indiegogo.com/favicon.ico', description: '众筹创新平台', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 6 },
  { id: 'crunchbase', name: 'Crunchbase', category: '产品资讯', icon: '📊', url: 'https://www.crunchbase.com', thumbnail: 'https://www.crunchbase.com/favicon.ico', description: '公司投融资资讯', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 7 },
  { id: 'angellist', name: 'AngelList', category: '产品资讯', icon: '👼', url: 'https://angel.co', thumbnail: 'https://angel.co/favicon.ico', description: '创业公司平台', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 6 },
  { id: 'g2', name: 'G2', category: '产品资讯', icon: '⭐', url: 'https://www.g2.com', thumbnail: 'https://www.g2.com/favicon.ico', description: '软件评测平台', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 7 },
  { id: 'capterra', name: 'Capterra', category: '产品资讯', icon: '📋', url: 'https://www.capterra.com', thumbnail: 'https://www.capterra.com/favicon.ico', description: '软件评测推荐', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 6 },

  { id: 'bloomberg', name: 'Bloomberg', category: '商业财经', icon: '📈', url: 'https://www.bloomberg.com', thumbnail: 'https://assets.bwbx.io/s3/javelin/public/javelin-images/favicon.ico', description: '财经新闻', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 8 },
  { id: 'reuters', name: 'Reuters', category: '商业财经', icon: '📰', url: 'https://www.reuters.com', thumbnail: 'https://www.reuters.com/favicon.ico', description: '国际新闻通讯社', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 9 },
  { id: 'forbes', name: 'Forbes', category: '商业财经', icon: '💰', url: 'https://www.forbes.com', thumbnail: 'https://www.forbes.com/favicon.ico', description: '商业财富资讯', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 8 },
  { id: 'businessinsider', name: 'Business Insider', category: '商业财经', icon: '💼', url: 'https://www.businessinsider.com', thumbnail: 'https://www.businessinsider.com/favicon.ico', description: '商业科技资讯', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 7 },
  { id: 'wsj', name: 'Wall Street Journal', category: '商业财经', icon: '📊', url: 'https://www.wsj.com', thumbnail: 'https://www.wsj.com/favicon.ico', description: '华尔街日报', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 8 },
  { id: 'ft', name: 'Financial Times', category: '商业财经', icon: '📰', url: 'https://www.ft.com', thumbnail: 'https://www.ft.com/__origami/service/image/v2/images/raw/ftlogo-v1%3Abrand-ft-logo-square-coloured', description: '英国金融时报', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 8 },
  { id: 'economist', name: 'The Economist', category: '商业财经', icon: '📖', url: 'https://www.economist.com', thumbnail: 'https://www.economist.com/favicon.ico', description: '经济学人杂志', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 8 },
  { id: 'cnbc', name: 'CNBC', category: '商业财经', icon: '📺', url: 'https://www.cnbc.com', thumbnail: 'https://www.cnbc.com/favicon.ico', description: '财经新闻电视网', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 7 },
  { id: '36kr', name: '36氪', category: '商业财经', icon: '🔵', url: 'https://36kr.com', thumbnail: 'https://36kr.com/favicon.ico', description: '中国创投资讯', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 8 },
  { id: 'tmtpost', name: '钛媒体', category: '商业财经', icon: '🟠', url: 'https://www.tmtpost.com', thumbnail: 'https://www.tmtpost.com/favicon.ico', description: '中国科技财经', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 7 },

  { id: 'googlenews', name: 'Google News', category: '综合资讯', icon: '📰', url: 'https://news.google.com', thumbnail: 'https://www.gstatic.com/images/icons/material/system/1x/news_black_48dp.png', description: 'Google新闻聚合', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 10 },
  { id: 'bingnews', name: 'Bing News', category: '综合资讯', icon: '🔵', url: 'https://www.bing.com/news', thumbnail: 'https://www.bing.com/favicon.ico', description: '微软新闻聚合', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 8 },
  { id: 'duckduckgo', name: 'DuckDuckGo', category: '综合资讯', icon: '🦆', url: 'https://duckduckgo.com', thumbnail: 'https://duckduckgo.com/favicon.ico', description: '隐私搜索引擎', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 7 },
  { id: 'flipboard', name: 'Flipboard', category: '综合资讯', icon: '📰', url: 'https://flipboard.com', thumbnail: 'https://flipboard.com/favicon.ico', description: '个性化新闻杂志', hasAPI: false, requiresAuth: false, scrapeMethod: 'rss', popularity: 6 },
  { id: 'feedly', name: 'Feedly', category: '综合资讯', icon: '📡', url: 'https://feedly.com', thumbnail: 'https://feedly.com/favicon.ico', description: 'RSS订阅工具', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 7 },
  { id: 'alltop', name: 'AllTop', category: '综合资讯', icon: '📋', url: 'https://alltop.com', thumbnail: 'https://alltop.com/favicon.ico', description: '综合资讯聚合', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 5 },
  { id: 'pocket', name: 'Pocket', category: '综合资讯', icon: '📥', url: 'https://getpocket.com', thumbnail: 'https://getpocket.com/favicon.ico', description: '稍后阅读服务', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 6 },
  { id: 'instapaper', name: 'Instapaper', category: '综合资讯', icon: '📄', url: 'https://www.instapaper.com', thumbnail: 'https://www.instapaper.com/favicon.ico', description: '文章收藏服务', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 5 },
  { id: 'matter', name: 'Matter', category: '综合资讯', icon: '📖', url: 'https://hq.getmatter.com', thumbnail: 'https://hq.getmatter.com/favicon.ico', description: '阅读管理工具', hasAPI: false, requiresAuth: false, scrapeMethod: 'html', popularity: 5 },
  { id: 'inoreader', name: 'Inoreader', category: '综合资讯', icon: '📰', url: 'https://www.inoreader.com', thumbnail: 'https://www.inoreader.com/favicon.ico', description: 'RSS阅读器', hasAPI: true, requiresAuth: false, scrapeMethod: 'api', popularity: 6 },
];

export function getSourcesByCategory(): Record<string, DataSource[]> {
  const result: Record<string, DataSource[]> = {};
  for (const source of DATA_SOURCES) {
    if (!result[source.category]) {
      result[source.category] = [];
    }
    result[source.category].push(source);
  }
  return result;
}

export function searchSources(query: string): DataSource[] {
  const lowerQuery = query.toLowerCase();
  return DATA_SOURCES.filter(
    s => s.name.toLowerCase().includes(lowerQuery) ||
         s.description.toLowerCase().includes(lowerQuery) ||
         s.category.toLowerCase().includes(lowerQuery)
  );
}

export function getSourceById(id: string): DataSource | undefined {
  return DATA_SOURCES.find(s => s.id === id);
}

const RSS_URL_SUFFIXES: Record<string, string> = {
  'techcrunch': '/feed/',
  'theverge': '/rss/index.xml',
  'arstechnica': '/feed/',
  'wired': '/feed/rss',
  'github': '/blog/feed/',
  'openai': '/blog/rss.xml',
  'googleai': '/technology/ai/rss/',
  'hackernews': 'https://hnrss.org/frontpage',
  'huggingface': '/api/feeds/datasets',
  'medium': '/tag/programming/feed',
  'dzone': '/feeds/articles',
  'infoq': '/feed',
  'freecodecamp': '/news/feed',
  'smashingmagazine': '/feed/',
  'csstricks': '/feed/',
  'sitepoint': '/feed/',
  'opensource': '/feed/',
  'engadget': '/rss.xml',
  'cnet': '/news/tech-and-science/rss/',
  'mashable': '/rss/articles',
  'venturebeat': '/feed/',
  'zdnet': '/news/rss/',
  'gizmodo': '/feed',
  'thenextweb': '/feed/',
  'techradar': '/feeds/all',
  'tomshardware': '/feeds/all',
  'pcmag': '/feeds/articles',
  '9to5mac': '/feed/',
  'mitnews': '/rss',
  'betalist': '/feed/',
  'googlescholar': 'https://scholar.google.com/scholar?q=artificial+intelligence&output=rss',
  'bloomberg': '/feed',
  'reuters': '/feed',
  'forbes': '/feed',
  'businessinsider': '/feed',
  'wsj': '/feed',
  'ft': '/feed',
  'economist': '/rss',
  'cnbc': '/id/100003114/device/rss/rss.html',
  'flipboard': '/feed/',
};

export function getRSSSources(): DataSource[] {
  return DATA_SOURCES.filter(source => source.scrapeMethod === 'rss');
}

export function getRSSSourceUrl(sourceId: string): string | undefined {
  const source = DATA_SOURCES.find(s => s.id === sourceId);
  if (source?.scrapeMethod === 'rss') {
    const suffix = RSS_URL_SUFFIXES[sourceId];
    if (suffix) {
      return suffix.startsWith('http') ? suffix : `${source.url}${suffix}`;
    }
    return source.url;
  }
  return undefined;
}
