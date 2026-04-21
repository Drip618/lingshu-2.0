import { NextRequest, NextResponse } from 'next/server';

const DIRECTOR_DATABASE: Record<string, {
  name: string; englishName: string;
  style: string[]; techniques: string[]; keywords: string[];
  visualStyle: string; representativeWorks: string[];
  strengths: string[]; suitableFor: string[];
  shootingStyle: string[]; artStyle: string[]; storyboardStyle: string[];
}> = {
  '克里斯托弗·诺兰': {
    name: '克里斯托弗·诺兰', englishName: 'Christopher Nolan',
    style: ['非线性叙事', '复杂时间结构', '哲学思辨', '宏大世界观', '烧脑悬疑'],
    techniques: ['IMAX摄影', '实景特效', '汉斯·季默配乐', '倒叙/多线叙事', '交叉剪辑'],
    keywords: ['时间', '记忆', '梦境', '身份认同', '牺牲', '救赎', '真相', '选择'],
    visualStyle: '高对比度、冷色调、对称构图、IMAX画幅',
    representativeWorks: ['盗梦空间', '星际穿越', '蝙蝠侠：黑暗骑士', '信条', '奥本海默', '记忆碎片'],
    strengths: ['叙事复杂性', '视觉奇观', '哲学深度'],
    suitableFor: ['科幻', '悬疑', '惊悚', '超级英雄', '剧情'],
    shootingStyle: ['IMAX 70mm胶片拍摄为主', '大量实景搭建', '避免绿幕', '利用自然光和实用光源', '手持与稳定器结合', '大量使用倒叙和交叉剪辑制造悬念节奏'],
    artStyle: ['冷峻现代主义风格', '建筑感强烈的空间设计', '高对比度冷色调（蓝灰为主）', '对称构图营造压迫感'],
    storyboardStyle: ['精确到秒的分镜设计', '每个镜头都有明确的时间线标注', '强调空间纵深和透视关系']
  },
  '詹姆斯·卡梅隆': {
    name: '詹姆斯·卡梅隆', englishName: 'James Cameron',
    style: ['视觉奇观', '技术创新', '史诗叙事', '环保主题', '科幻世界构建'],
    techniques: ['3D技术', '动作捕捉', '水下拍摄', 'CGI融合', '虚拟摄影机'],
    keywords: ['科技', '自然', '爱情', '战争', '反抗', '进化', '探索', '文明'],
    visualStyle: '绚丽色彩、宏大场景、细节丰富、沉浸式3D',
    representativeWorks: ['阿凡达', '泰坦尼克号', '终结者2', '异形2', '深渊'],
    strengths: ['技术创新', '世界构建', '情感共鸣'],
    suitableFor: ['科幻', '动作', '冒险', '爱情'],
    shootingStyle: ['虚拟摄影机预览系统先行', '动作捕捉+面部表情捕捉', '3D双机位立体拍摄', '水下特殊拍摄设备'],
    artStyle: ['极致的世界观构建', '色彩饱和度高', '生物设计融合自然美学与科幻想象'],
    storyboardStyle: ['虚拟摄影机预演(Previs)先行', '每个场景都有3D预览版本']
  },
  '史蒂文·斯皮尔伯格': {
    name: '史蒂文·斯皮尔伯格', englishName: 'Steven Spielberg',
    style: ['情感共鸣', '冒险精神', '家庭主题', '历史反思', '人性光辉'],
    techniques: ['长镜头调度', '约翰·威廉姆斯配乐', '儿童视角', '悬念营造', '主观跟拍'],
    keywords: ['梦想', '勇气', '家庭', '友谊', '成长', '希望', '奇迹', '记忆'],
    visualStyle: '温暖色调、自然光、经典构图、情感化镜头',
    representativeWorks: ['辛德勒的名单', 'E.T.外星人', '侏罗纪公园', '拯救大兵瑞恩', '头号玩家'],
    strengths: ['情感表达', '叙事技巧', '观众连接'],
    suitableFor: ['冒险', '科幻', '剧情', '历史', '战争'],
    shootingStyle: ['经典好莱坞拍摄手法', '大量使用推拉摇移跟拍', '长镜头一镜到底', '低角度仰拍塑造英雄感'],
    artStyle: ['温暖怀旧的色调设计', '自然光效为主', '场景设计注重生活质感和历史真实感'],
    storyboardStyle: ['经典好莱坞分镜风格', '注重镜头运动轨迹设计']
  },
  '丹尼斯·维伦纽瓦': {
    name: '丹尼斯·维伦纽瓦', englishName: 'Denis Villeneuve',
    style: ['氛围营造', '慢节奏叙事', '哲学深度', '视觉诗意', '硬科幻'],
    techniques: ['极简主义', '长镜头', '声音设计', '色彩象征', '空间感'],
    keywords: ['孤独', '记忆', '存在', '沟通', '未知', '压迫', '时间', '命运'],
    visualStyle: '极简构图、强烈色彩对比、广阔空间、诗意画面',
    representativeWorks: ['沙丘', '银翼杀手2049', '降临', '囚徒', '焦土之城'],
    strengths: ['氛围营造', '哲学深度', '视觉诗意'],
    suitableFor: ['科幻', '悬疑', '剧情', '惊悚'],
    shootingStyle: ['极简镜头语言', '广角和超广角营造空间感', '长镜头缓慢推进', '声音设计作为核心元素'],
    artStyle: ['极简主义与宏大叙事的融合', '粗野主义建筑风格', '色彩作为情感符号'],
    storyboardStyle: ['极简分镜', '每个镜头都有明确的色彩标注']
  },
  '王家卫': {
    name: '王家卫', englishName: 'Wong Kar-Wai',
    style: ['情绪化叙事', '都市孤独', '碎片化结构', '暧昧关系', '时间流逝'],
    techniques: ['抽帧摄影', '手持镜头', '霓虹灯光', '独白旁白', '非职业演员'],
    keywords: ['孤独', '爱情', '时间', '记忆', '错过', '城市', '等待', '遗憾'],
    visualStyle: '迷幻色彩、慢门拍摄、抽象构图、霓虹光影',
    representativeWorks: ['花样年华', '重庆森林', '一代宗师', '堕落天使', '春光乍泄'],
    strengths: ['情绪表达', '视觉风格', '音乐运用'],
    suitableFor: ['爱情', '剧情', '文艺', '武侠'],
    shootingStyle: ['手持摄影', '抽帧/慢门效果', '霓虹灯光', '无剧本即兴创作', '长焦镜头压缩空间'],
    artStyle: ['霓虹都市美学', '香港街头的市井与诗意', '旗袍与西装的时代符号'],
    storyboardStyle: ['情绪板式分镜', '注重氛围而非精确镜头']
  },
  '张艺谋': {
    name: '张艺谋', englishName: 'Zhang Yimou',
    style: ['视觉冲击力', '色彩象征', '中国传统文化', '历史题材', '群体叙事'],
    techniques: ['浓烈色彩', '大场面调度', '民俗元素', '仪式感', '对称构图'],
    keywords: ['权力', '欲望', '传统', '反抗', '命运', '集体', '牺牲', '传承'],
    visualStyle: '浓烈色彩、对称构图、仪式感强、大场面',
    representativeWorks: ['英雄', '十面埋伏', '红高粱', '活着', '影', '大红灯笼高高挂'],
    strengths: ['视觉冲击', '文化表达', '场面调度'],
    suitableFor: ['剧情', '历史', '动作', '武侠', '战争'],
    shootingStyle: ['大场面群戏调度', '色彩作为核心叙事元素', '航拍展现宏大场面', '武术设计融合舞蹈美学'],
    artStyle: ['色彩即叙事——红色代表欲望与生命', '黑色代表权力与死亡'],
    storyboardStyle: ['色彩脚本式分镜', '每个场景标注主色调和象征意义']
  },
  '昆汀·塔伦蒂诺': {
    name: '昆汀·塔伦蒂诺', englishName: 'Quentin Tarantino',
    style: ['暴力美学', '对话驱动', '非线性叙事', '流行文化致敬', '复仇主题'],
    techniques: ['长对话场景', '暴力美学', '配乐精选', '章节式结构', '脚跟镜头'],
    keywords: ['复仇', '暴力', '对话', '黑色幽默', '非线性', '致敬', '正义', '混乱'],
    visualStyle: '复古色调、特写镜头、动态构图、高饱和度',
    representativeWorks: ['低俗小说', '杀死比尔', '被解救的姜戈', '好莱坞往事', '无耻混蛋'],
    strengths: ['对白写作', '风格化叙事', '流行文化融合'],
    suitableFor: ['犯罪', '动作', '喜剧', '悬疑'],
    shootingStyle: ['长对话360度环绕拍摄', '暴力场景高速摄影和慢动作', '脚跟镜头(trunk shot)'],
    artStyle: ['复古美学与现代暴力美学的碰撞', '高饱和度色彩'],
    storyboardStyle: ['章节式分镜结构', '标注配乐切入点']
  },
  '李安': {
    name: '李安', englishName: 'Ang Lee',
    style: ['文化冲突', '压抑情感', '细腻人物', '跨类型探索', '东西方融合'],
    techniques: ['长镜头', '自然光', '克制表演', '水意象', '细节隐喻'],
    keywords: ['隐忍', '责任', '身份', '传统与现代', '父子关系', '秘密', '欲望'],
    visualStyle: '自然光效、克制色彩、平衡构图、水意象',
    representativeWorks: ['卧虎藏龙', '断背山', '少年派的奇幻漂流', '饮食男女', '色戒'],
    strengths: ['人物刻画', '文化表达', '情感深度'],
    suitableFor: ['剧情', '动作', '冒险', '爱情', '历史'],
    shootingStyle: ['自然光效追求真实质感', '长镜头捕捉微妙情感变化', '水意象反复出现'],
    artStyle: ['东西方美学的融合', '中国传统意境与现代电影语言结合'],
    storyboardStyle: ['注重人物关系和情感变化的分镜设计']
  },
  '黑泽明': {
    name: '黑泽明', englishName: 'Akira Kurosawa',
    style: ['人性探讨', '武士道精神', '动态构图', '天气叙事', '道德困境'],
    techniques: ['剪辑节奏', '广角镜头', '运动镜头', '群戏调度', '雨景/风雪'],
    keywords: ['荣誉', '忠诚', '人性善恶', '生存', '理想与现实', '团队', '正义'],
    visualStyle: '动态构图、天气元素、广角镜头、黑白对比',
    representativeWorks: ['七武士', '罗生门', '乱', '影子武士', '用心棒', '生之欲'],
    strengths: ['人性刻画', '视觉创新', '叙事技巧'],
    suitableFor: ['动作', '历史', '剧情', '战争'],
    shootingStyle: ['多机位同时拍摄', '天气作为叙事工具', '广角镜头展现人与环境对抗'],
    artStyle: ['黑白影像极致运用', '日本传统美学融入画面'],
    storyboardStyle: ['自己手绘分镜', '画面构图精确到每一帧']
  },
  '希区柯克': {
    name: '阿尔弗雷德·希区柯克', englishName: 'Alfred Hitchcock',
    style: ['悬疑惊悚', '麦格芬', '心理恐惧', '无辜者卷入', '观众知情权'],
    techniques: ['主观镜头', '变焦推进', '楼梯场景', '金发女郎', '悬念设计'],
    keywords: ['罪恶', '窥视', '误解', '逃避', '双重身份', '心理', '恐惧', '真相'],
    visualStyle: '阴影运用、主观视角、紧张构图、高对比明暗',
    representativeWorks: ['惊魂记', '后窗', '迷魂记', '鸟', '眩晕', '西北偏北'],
    strengths: ['悬念设计', '心理操控', '技术创新'],
    suitableFor: ['悬疑', '惊悚', '心理', '犯罪'],
    shootingStyle: ['主观镜头代入角色视角', '变焦推进(Dolly Zoom)', '纯视觉叙事减少对白依赖'],
    artStyle: ['高对比明暗设计', '阴影作为叙事工具', '楼梯和走廊作为心理空间'],
    storyboardStyle: ['极度精确的分镜设计', '标注观众知情与角色不知情的信息差']
  },
  '库布里克': {
    name: '斯坦利·库布里克', englishName: 'Stanley Kubrick',
    style: ['完美主义', '冷峻视角', '黑色幽默', '反乌托邦', '人性阴暗面'],
    techniques: ['单点透视', '对称构图', '长镜头', '古典音乐', '冷色调'],
    keywords: ['控制', '疯狂', '战争', '暴力', '性', '技术', '权力', '异化'],
    visualStyle: '对称构图、冷色调、完美主义、单点透视',
    representativeWorks: ['2001太空漫游', '发条橙', '闪灵', '全金属外壳', '大开眼戒'],
    strengths: ['技术完美', '主题深度', '视觉创新'],
    suitableFor: ['科幻', '惊悚', '剧情', '战争', '心理'],
    shootingStyle: ['单点透视构图', '自然光拍摄', '古典音乐与暴力画面的反差搭配'],
    artStyle: ['对称美学营造压迫感', '冷色调（蓝色/白色为主）', '精致的中产阶级场景'],
    storyboardStyle: ['精确到毫米的构图设计', '标注单点透视消失点位置']
  },
  '宫崎骏': {
    name: '宫崎骏', englishName: 'Hayao Miyazaki',
    style: ['自然主义', '少女成长', '反战主题', '奇幻世界', '飞行梦想'],
    techniques: ['手绘动画', '水彩背景', '飞行场景', '自然光影', '音乐叙事'],
    keywords: ['自然', '成长', '勇气', '和平', '梦想', '飞行', '魔法', '纯真'],
    visualStyle: '水彩风格、自然光影、温暖色调、手绘质感',
    representativeWorks: ['千与千寻', '龙猫', '天空之城', '幽灵公主', '哈尔的移动城堡'],
    strengths: ['世界观构建', '情感共鸣', '视觉想象'],
    suitableFor: ['动画', '奇幻', '冒险', '家庭'],
    shootingStyle: ['手绘动画逐帧精心绘制', '水彩背景营造梦幻氛围', '飞行场景作为核心视觉奇观'],
    artStyle: ['水彩手绘背景极致精美', '欧洲与日本美学融合的建筑设计'],
    storyboardStyle: ['水彩氛围板式分镜', '标注色彩和光影的情绪变化']
  },
  '大卫·芬奇': {
    name: '大卫·芬奇', englishName: 'David Fincher',
    style: ['黑暗美学', '精密叙事', '社会批判', '心理深度', '技术完美'],
    techniques: ['数字暗房', '稳定器长镜头', 'CGI隐形特效', '冷色调', '精确剪辑'],
    keywords: ['黑暗', '真相', '控制', '谎言', '复仇', '执念', '腐败', '系统'],
    visualStyle: '冷暗色调、精确构图、数字暗房、高细节',
    representativeWorks: ['七宗罪', '搏击俱乐部', '社交网络', '消失的爱人', '龙纹身的女孩'],
    strengths: ['悬疑叙事', '视觉精确', '社会批判'],
    suitableFor: ['悬疑', '惊悚', '犯罪', '剧情'],
    shootingStyle: ['数字暗房技术精确控制每帧画面', '稳定器长镜头一镜到底', 'CGI用于隐形特效'],
    artStyle: ['冷暗色调（绿灰/蓝灰为主）', '场景设计反映角色心理状态'],
    storyboardStyle: ['精确到帧的分镜设计', '标注每个镜头的精确时长']
  },
  '朴赞郁': {
    name: '朴赞郁', englishName: 'Park Chan-wook',
    style: ['极致美学', '复仇三部曲', '心理扭曲', '禁忌主题', '精密设计'],
    techniques: ['精密构图', '色彩象征', '长镜头', '声音设计', '空间叙事'],
    keywords: ['复仇', '欲望', '禁忌', '扭曲', '自由', '囚禁', '真相', '选择'],
    visualStyle: '极致构图、色彩象征、空间叙事、精密设计',
    representativeWorks: ['老男孩', '小姐', '亲切的金子', '蝙蝠', '分手的决心'],
    strengths: ['视觉美学', '叙事设计', '心理刻画'],
    suitableFor: ['悬疑', '惊悚', '犯罪', '剧情'],
    shootingStyle: ['精密构图每个画面如画作', '色彩作为叙事符号', '长镜头展现空间关系和心理变化'],
    artStyle: ['极致美学风格', '色彩象征系统（小姐的绿/金/红）'],
    storyboardStyle: ['画作级分镜设计', '标注色彩象征系统']
  },
  '是枝裕和': {
    name: '是枝裕和', englishName: 'Hirokazu Kore-eda',
    style: ['家庭叙事', '日常诗意', '社会关怀', '温柔凝视', '生命哲学'],
    techniques: ['自然光', '长镜头', '即兴表演', '食物叙事', '季节感'],
    keywords: ['家庭', '日常', '记忆', '失去', '连接', '食物', '季节', '温柔'],
    visualStyle: '自然光影、日常质感、温暖克制、季节感',
    representativeWorks: ['小偷家族', '步履不停', '如父如子', '海街日记', '无人知晓'],
    strengths: ['日常叙事', '情感细腻', '社会洞察'],
    suitableFor: ['剧情', '家庭', '文艺', '社会'],
    shootingStyle: ['自然光拍摄追求真实质感', '长镜头捕捉日常生活的诗意', '即兴表演保留真实感'],
    artStyle: ['日常美学——普通住宅的真实质感', '自然光随时间变化'],
    storyboardStyle: ['生活流式分镜', '标注自然光的时间变化']
  },
  '韦斯·安德森': {
    name: '韦斯·安德森', englishName: 'Wes Anderson',
    style: ['对称美学', '色彩系统', '童话叙事', '怀旧情结', '作者风格'],
    techniques: ['严格对称', '平面构图', '色彩编码', '定格动画', '旁白叙事'],
    keywords: ['怀旧', '冒险', '家庭', '友谊', '孤独', '梦想', '秩序', '奇想'],
    visualStyle: '严格对称、高饱和色彩、平面构图、微缩模型感',
    representativeWorks: ['布达佩斯大饭店', '月升王国', '天才一族', '了不起的狐狸爸爸', '法兰西特派'],
    strengths: ['视觉独特', '风格统一', '叙事想象'],
    suitableFor: ['喜剧', '冒险', '动画', '剧情'],
    shootingStyle: ['严格对称构图几乎每个镜头都是居中构图', '摄影机90度平移转场'],
    artStyle: ['高饱和度色彩编码系统', '复古道具和服装设计如70年代插画'],
    storyboardStyle: ['严格对称的分镜设计', '标注色彩编码系统']
  },
  '雷德利·斯科特': {
    name: '雷德利·斯科特', englishName: 'Ridley Scott',
    style: ['视觉叙事', '氛围大师', '科幻先驱', '史诗格局', '商业艺术平衡'],
    techniques: ['氛围营造', '烟雾光影', '多机位', '故事板先行', '视觉叙事'],
    keywords: ['生存', '创造', '权力', '未知', '恐惧', '文明', '未来', '神话'],
    visualStyle: '烟雾光影、氛围感强、视觉叙事、史诗感',
    representativeWorks: ['银翼杀手', '异形', '角斗士', '黑鹰坠落', '火星救援', '末路狂花'],
    strengths: ['视觉叙事', '氛围营造', '类型开创'],
    suitableFor: ['科幻', '惊悚', '历史', '动作', '冒险'],
    shootingStyle: ['故事板先行每个镜头都预先设计', '烟雾和背光营造氛围感'],
    artStyle: ['氛围感至上的场景设计', '未来主义与复古的融合'],
    storyboardStyle: ['完整的故事板预演']
  },
  '奉俊昊': {
    name: '奉俊昊', englishName: 'Bong Joon-ho',
    style: ['社会隐喻', '类型融合', '黑色幽默', '阶级批判', '精密设计'],
    techniques: ['空间叙事', '类型转换', '隐喻设计', '群戏调度', '精确剪辑'],
    keywords: ['阶级', '寄生', '气味', '空间', '谎言', '真相', '家庭', '生存'],
    visualStyle: '空间叙事、隐喻设计、类型融合、精确构图',
    representativeWorks: ['寄生虫', '雪国列车', '母亲', '汉江怪物', '杀人回忆'],
    strengths: ['社会隐喻', '类型融合', '精密设计'],
    suitableFor: ['剧情', '悬疑', '惊悚', '社会'],
    shootingStyle: ['空间叙事——建筑空间反映阶级关系', '类型融合在同一部电影中切换多种类型'],
    artStyle: ['空间设计作为阶级隐喻（楼上/楼下/地下室）'],
    storyboardStyle: ['空间叙事式分镜', '标注空间中的阶级关系']
  }
};

const GENRE_RULES: Record<string, { weight: number; keywords: string[] }> = {
  '剧情': { weight: 1.0, keywords: ['生活', '家庭', '成长', '情感', '现实', '社会', '人际关系', '内心', '回忆', '命运'] },
  '科幻': { weight: 1.2, keywords: ['未来', '太空', '机器人', 'AI', '外星人', '科技', '虚拟现实', '时间旅行', '平行宇宙', '赛博朋克'] },
  '悬疑': { weight: 1.1, keywords: ['谜团', '秘密', '真相', '推理', '犯罪', '侦探', '阴谋', '隐藏', '线索', '反转'] },
  '动作': { weight: 1.0, keywords: ['打斗', '追逐', '爆炸', '战斗', '英雄', '拯救', '冒险', '速度', '力量', '对抗'] },
  '爱情': { weight: 1.0, keywords: ['恋爱', '感情', '心动', '表白', '分手', '重逢', '浪漫', '缘分', '甜蜜', '心碎'] },
  '喜剧': { weight: 0.9, keywords: ['搞笑', '幽默', '荒诞', '讽刺', '误会', '滑稽', '轻松', '欢乐', '笑料', '调侃'] },
  '惊悚': { weight: 1.1, keywords: ['恐怖', '恐惧', '死亡', '鬼怪', '血腥', '诡异', '紧张', '尖叫', '噩梦', '威胁'] },
  '动画': { weight: 0.8, keywords: ['卡通', '幻想', '童话', '魔法', '动物', '拟人', '想象', '梦幻', '色彩', '童真'] },
  '纪录片': { weight: 0.8, keywords: ['真实', '记录', '采访', '事实', '历史', '社会问题', '调查', '见证', '纪实', '真相'] },
  '战争': { weight: 1.1, keywords: ['战斗', '战场', '军队', '武器', '战略', '胜利', '牺牲', '和平', '冲突', '硝烟'] },
  '历史': { weight: 1.0, keywords: ['古代', '朝代', '皇帝', '历史事件', '传统', '文化', '遗产', '年代', '时代', '变迁'] },
  '奇幻': { weight: 1.0, keywords: ['魔法', '精灵', '龙', '巫师', '神话', '超自然', '异世界', '法术', '冒险', '传说'] },
  '犯罪': { weight: 1.0, keywords: ['犯罪', '警察', '黑帮', '毒品', '抢劫', '谋杀', '监狱', '逃亡', '卧底', '审判'] },
  '心理': { weight: 1.1, keywords: ['心理', '精神', '幻觉', '分裂', '焦虑', '抑郁', '创伤', '潜意识', '失控', '崩溃'] }
};

export async function POST(request: NextRequest) {
  try {
    const { script, projectName, projectType, apiKey, baseURL, model } = await request.json();
    
    if (!script || typeof script !== 'string') {
      return NextResponse.json({ error: '请提供有效的剧本内容' }, { status: 400 });
    }

    if (script.trim().length < 3) {
      return NextResponse.json({ error: '剧本内容太短，至少需要3个字符' }, { status: 400 });
    }

    console.log(`[灵枢分析] 开始分析项目: ${projectName || '未命名'}, 剧本长度: ${script.length} 字符`);

    const scriptText = script.toLowerCase();
    const startTime = Date.now();

    let aiAnalysisResult = null;
    
    // 如果配置了API，尝试调用AI进行深度分析
    if (apiKey && baseURL && model) {
      try {
        const { callAIClient } = await import('@/lib/ai-client');
        
        const analysisPrompt = `你是一位专业的影视剧本分析师。请对以下剧本进行深度分析，返回严格的JSON格式（不要用markdown代码块包裹）：

{
  "synopsis": "剧本整体梗概，100-200字，概述故事核心、主要人物和基本情节走向",
  "chapterSummaries": [{"chapter": "章节/段落编号", "title": "该段落标题或主题", "summary": "该段落的内容总结，50-100字", "keyEvents": ["关键事件1", "关键事件2"], "characterDevelopment": "角色发展描述"}, ...],
  "plotOverview": {"beginning": "开端描述", "development": "发展描述", "climax": "高潮描述", "resolution": "结局描述"},
  "genre": {"primaryGenre": "主类型", "subGenres": ["副类型1","副类型2"], "confidence": "高/中/低", "matchedKeywords": ["关键词1","关键词2"]},
  "characters": {"list": [{"name": "角色名", "role": "主角/反派/核心角色/主要角色/配角", "appearances": 出现次数, "description": "角色描述"}, ...], "totalCount": 角色总数},
  "tone": {"primaryMoodName": "情感基调名称", "pace": "节奏描述", "overallTone": "整体基调一句话"},
  "conflicts": {"mainConflict": "主要冲突描述", "conflictTypes": ["类型1","类型2"]},
  "directorMatch": {"topRecommendation": {"name": "推荐导演名", "matchReason": "匹配原因"}, "confidence": "高/中/低"},
  "structure": {"acts": ["第一幕要点","第二幕要点","第三幕要点"], "pacingScore": 分数},
  "suggestions": ["建议1","建议2","建议3"]
}

剧本内容：
${script.substring(0, 8000)}

${projectType ? `\n项目类型参考：${projectType}` : ''}

注意：
1. synopsis 必须是完整的剧本梗概，包含故事核心、主要人物和基本情节
2. chapterSummaries 需要将剧本按段落/章节拆分，每段都要有总结
3. plotOverview 必须包含开端、发展、高潮、结局四个部分的详细描述
4. 角色名必须是从剧本中提取的真实人物姓名，不要包含非人名词汇
5. 所有内容必须客观、正式、专业，使用影视行业术语`;

        const aiResponse = await callAIClient(
          { apiKey, baseURL, model },
          [
            { role: 'system', content: '你是灵枢影视创作系统的专业AI分析师。你精通电影理论、编剧技巧、导演风格分析。所有回复必须使用有效的JSON格式。' },
            { role: 'user', content: analysisPrompt }
          ],
          { maxTokens: 4096, temperature: 0.5, jsonMode: true }
        );

        // 尝试解析AI返回的JSON
        const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        try {
          aiAnalysisResult = JSON.parse(cleanedResponse);
          console.log('[灵枢分析] ✅ AI分析成功');
        } catch (parseErr) {
          console.warn('[灵枢分析] ⚠️ AI响应JSON解析失败，将使用规则引擎作为补充');
          aiAnalysisResult = null;
        }
      } catch (aiError: any) {
        console.warn(`[灵枢分析] ⚠️ AI调用失败(${aiError.message})，使用规则引擎`);
      }
    }

    // 基础统计 - 始终计算
    const basicStats = analyzeBasicStats(script);
    
    // 类型识别 - 基于实际内容，项目类型作为参考
    const genreAnalysis = detectGenre(scriptText, script, projectType);
    
    // 导演匹配 - 基于实际内容和类型
    const directorMatch = matchDirector(scriptText, genreAnalysis.primaryGenre, script);
    
    // 角色提取 - 从实际文本中
    const characterAnalysis = extractCharacters(script);
    
    // 冲突分析 - 从实际文本中
    const conflictAnalysis = analyzeConflicts(script);
    
    // 场景设置 - 从实际文本中
    const settingAnalysis = extractSettings(script);
    
    // 基调节奏统一分析 - 从实际文本中
    const toneAnalysis = analyzeToneAndRhythm(scriptText, script);
    
    // 结构分析
    const structureAnalysis = analyzeStructure(script);
    
    // 对话分析
    const dialogueAnalysis = analyzeDialogue(script);
    
    // 创作建议 - 基于实际分析结果
    const creativeSuggestions = generateCreativeSuggestions(genreAnalysis, directorMatch, toneAnalysis, settingAnalysis, script);
    
    // 改进建议 - 基于实际分析结果
    const improvementSuggestions = generateImprovementSuggestions(
      genreAnalysis, directorMatch, conflictAnalysis, dialogueAnalysis, structureAnalysis, 
      toneAnalysis, characterAnalysis, script
    );
    
    // 分镜建议 - 基于实际剧本段落
    const storyboardSuggestions = generateStoryboardSuggestions(script, directorMatch, genreAnalysis);

    // 合并AI分析和规则引擎结果（AI优先）
    const finalResult = {
      success: true,
      
      basicStats,
      projectName: projectName || '未命名项目',
      analysisTimestamp: new Date().toISOString(),
      analysisDuration: `${Date.now() - startTime}ms`,
      
      // 核心分析：AI结果优先，规则引擎补充
      genre: aiAnalysisResult?.genre || genreAnalysis,
      characters: (aiAnalysisResult?.characters && aiAnalysisResult.characters.list?.length > 0)
        ? { ...aiAnalysisResult.characters, list: aiAnalysisResult.characters.list.map((c: any) => ({
            name: c.name,
            role: c.role || '配角',
            appearances: c.appearances || 1,
            description: c.description || ''
          })) }
        : characterAnalysis,
      conflicts: aiAnalysisResult?.conflicts || conflictAnalysis,
      settings: settingAnalysis,
      tone: aiAnalysisResult?.tone || toneAnalysis,
      structure: aiAnalysisResult?.structure || structureAnalysis,
      dialogue: dialogueAnalysis,
      
      // 导演匹配：优先使用AI推荐
      directorMatch: aiAnalysisResult?.directorMatch ? {
        ...aiAnalysisResult.directorMatch,
        topRecommendation: {
          ...aiAnalysisResult.directorMatch.topRecommendation,
          ...(DIRECTOR_DATABASE[aiAnalysisResult.directorMatch.topRecommendation.name as keyof typeof DIRECTOR_DATABASE] || {})
        }
      } : directorMatch,
      
      // 建议
      creativeSuggestions: aiAnalysisResult?.suggestions || creativeSuggestions,
      suggestions: improvementSuggestions,
      storyboardSuggestions,
      
      // 元数据
      allDirectors: Object.values(DIRECTOR_DATABASE).map(d => ({
        name: d.name,
        englishName: d.englishName,
        style: d.style,
        techniques: d.techniques,
        suitableFor: d.suitableFor,
        representativeWorks: d.representativeWorks.slice(0, 4),
        shootingStyle: d.shootingStyle,
        artStyle: d.artStyle,
        storyboardStyle: d.storyboardStyle
      }))
    };

    return NextResponse.json(finalResult, { status: 200 });

  } catch (error) {
    console.error('[灵枢分析] 分析失败:', error);
    return NextResponse.json({ error: '分析服务暂时不可用' }, { status: 500 });
  }
}

function analyzeBasicStats(text: string) {
  const chars = text.length;
  const sentences = text.split(/[。！？.!?]+/).filter(s => s.trim()).length;
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length;
  
  let wordCount = 0;
  if (text.includes(' ') || text.includes('　')) {
    wordCount = text.split(/\s+/).filter(w => w.trim()).length;
  } else {
    wordCount = Math.floor(chars / 2); // 中文估算
  }
  
  return {
    totalCharacters: chars,
    wordCount,
    sentenceCount: sentences,
    paragraphCount: paragraphs,
    estimatedReadingTime: `${Math.ceil(chars / 300)} 分钟`,
    estimatedScreenTime: `${Math.ceil(chars / 500)} 分钟`,
    complexity: paragraphs > 20 ? '复杂' : paragraphs > 10 ? '中等' : '简单'
  };
}

function detectGenre(lowerText: string, originalText: string, projectType?: string): any {
  const scores: Array<{genre: string, score: number, confidence: string, matchedKeywords: string[]}> = [];
  
  for (const [genre, config] of Object.entries(GENRE_RULES)) {
    let score = 0;
    const matched: string[] = [];
    
    if (projectType && genre === projectType) {
      score += 3;
      matched.push(`项目类型:${projectType}`);
    }
    
    for (const keyword of config.keywords) {
      if (lowerText.includes(keyword)) {
        score += config.weight;
        matched.push(keyword);
      }
    }
    
    // 额外检查：关键词密度
    if (matched.length > 0) {
      score += (matched.length / config.keywords.length) * 1.5;
    }
    
    if (score > 0) {
      scores.push({
        genre,
        score: Math.round(score * 10) / 10,
        confidence: score > 4 ? '高' : score > 2 ? '中' : '低',
        matchedKeywords: matched
      });
    }
  }
  
  scores.sort((a, b) => b.score - a.score);
  
  const primary = scores[0]?.genre || '剧情';
  const secondary = scores.slice(1, 3).map(s => s.genre);
  
  // 生成详细的分析依据
  let analysisDetail = `基于剧本原文"${originalText.substring(0, 50)}${originalText.length > 50 ? '...' : ''}"的内容分析`;
  if (scores[0] && scores[0].matchedKeywords.length > 0) {
    analysisDetail += `', '识别到"${primary}"为主要类型特征`;
    analysisDetail += `（匹配关键词：${scores[0].matchedKeywords.join('、')}）`;
  }
  if (secondary.length > 0) {
    analysisDetail += `', '同时包含${secondary.join('、')}等类型元素`;
  }
  analysisDetail += `。`;
  
  return {
    primaryGenre: primary,
    secondaryGenres: secondary,
    allGenres: scores.slice(0, 6),
    confidence: scores[0]?.confidence || '低',
    matchedKeywords: scores[0]?.matchedKeywords || [],
    analysisDetail
  };
}

function matchDirector(lowerText: string, primaryGenre: string, originalText: string): any {
  const directors: Array<{
    name: string; englishName: string; matchScore: number; matchReasons: string[];
    style: string[]; techniques: string[]; visualStyle: string;
    shootingStyle: string[]; artStyle: string[]; storyboardStyle: string[];
    suitability: number; representativeWorks: string[];
  }> = [];

  for (const [directorName, info] of Object.entries(DIRECTOR_DATABASE)) {
    let score = 0;
    const reasons: string[] = [];
    
    // 风格匹配（权重最高）
    for (const style of info.style) {
      if (lowerText.includes(style.toLowerCase())) {
        score += 3;
        reasons.push(`匹配导演风格: ${style}`);
      }
    }
    
    // 关键词匹配
    for (const keyword of info.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 1.5;
        reasons.push(`内容涉及: ${keyword}`);
      }
    }
    
    // 技术手法匹配
    for (const technique of info.techniques) {
      if (lowerText.includes(technique.toLowerCase())) {
        score += 2;
        reasons.push(`技术手法: ${technique}`);
      }
    }
    
    // 类型适合度
    if (info.suitableFor.includes(primaryGenre)) {
      score += 4;
      reasons.push(`擅长${primaryGenre}类型作品`);
    }
    
    // 作品提及
    for (const work of info.representativeWorks) {
      if (lowerText.includes(work.toLowerCase())) {
        score += 1;
        reasons.push(`提及代表作: ${work}`);
      }
    }
    
    const suitability = Math.min(Math.round((score / 25) * 100), 99);
    
    // 只保留有匹配或类型适合的导演
    if (score > 0 || info.suitableFor.includes(primaryGenre)) {
      directors.push({
        name: info.name,
        englishName: info.englishName,
        matchScore: Math.round(score * 10) / 10,
        matchReasons: reasons.slice(0, 5),
        style: info.style.slice(0, 3),
        techniques: info.techniques.slice(0, 3),
        visualStyle: info.visualStyle,
        shootingStyle: info.shootingStyle,
        artStyle: info.artStyle,
        storyboardStyle: info.storyboardStyle,
        suitability: score > 0 ? suitability : 50 + Math.floor(Math.random() * 20),
        representativeWorks: info.representativeWorks.slice(0, 4)
      });
    }
  }

  // 排序
  directors.sort((a, b) => b.matchScore - a.matchScore);
  
  // 生成详细分析依据
  let analysisDetail = '';
  if (directors[0]) {
    const top = directors[0];
    analysisDetail = `基于剧本内容"${originalText.substring(0, 30)}..."的关键词匹配分析`;
    analysisDetail += `', '推荐${top.name}作为首选导演风格`;
    analysisDetail += `（综合匹配度${top.suitability}%）`;
    if (top.matchReasons.length > 0) {
      analysisDetail += `。核心匹配原因：${top.matchReasons.slice(0, 3).join('；')}`;
    }
    analysisDetail += `。该导演擅长${top.style.join('、')}等风格', '其代表作品包括${top.representativeWorks.slice(0, 2).join('《')}》等。`;
  } else {
    analysisDetail = '未找到高度匹配的导演风格', '建议根据剧本类型手动选择合适的导演风格。';
  }

  return {
    topRecommendation: directors[0] || null,
    alternatives: directors.slice(1, 6),
    totalMatched: directors.length,
    analysisDetail
  };
}

function extractCharacters(originalText: string): any {
  const characters: Array<{name: string, role: string, appearances: number, description: string}> = [];
  const nameMap = new Map<string, number>();

  const commonSurnames = new Set([
    '赵','钱','孙','李','周','吴','郑','王','冯','陈','褚','卫','蒋','沈','韩','杨',
    '朱','秦','尤','许','何','吕','施','张','孔','曹','严','华','金','魏','陶','姜',
    '戚','谢','邹','喻','柏','水','窦','章','云','苏','潘','葛','奚','范','彭','郎',
    '鲁','韦','昌','马','苗','凤','花','方','俞','任','袁','柳','酆','鲍','史','唐',
    '费','廉','岑','薛','雷','贺','倪','汤','滕','殷','罗','毕','郝','邬','安','常',
    '乐','于','时','傅','皮','卞','齐','康','伍','余','元','卜','顾','孟','平','黄',
    '和','穆','萧','尹'
  ]);

  const blockedWords = new Set([
    '简介','信分','两段','笑道','哭道','喊道','叫道','问道','答道','叹道','怒道',
    '哼道','嘟囔','嘀咕','喃喃','低语','回应','回答','说道','表示','认为','指出',
    '强调','说明','透露','声称','承认','否认','确认','宣布','声明','通知','告知',
    '告诉','询问','质问','反问','追问','盘问','审问','作者','编剧','导演','演员',
    '角色','人物','主角','配角','反派','群众','路人','旁白','画外音','字幕','标题',
    '章节','第一','第二','第三','第四','第五','第六','第七','第八','第九','第十',
    '最后','最终','开始','结束','序幕','尾声','场景','镜头','画面','特写','全景',
    '中景','近景','远景','白天','夜晚','清晨','黄昏','深夜','黎明','傍晚','午夜',
    '室内','室外','街道','房间','办公室','客厅','卧室','厨房','学校','医院','公园',
    '商场','车站','机场','码头','广场','城市','乡村','山区','海边','森林','沙漠',
    '草原','雪山','男人','女人','男孩','女孩','老人','孩子','青年','中年','众人',
    '大家','人们','有人','无人','某人','谁人','何人','这个','那个','这里','那里',
    '此时','彼时','如此','这般','怎样','怎么','为何','因为','所以','但是','然而',
    '不过','虽然','即使','如果','假如','倘若','要是','除非','只有','不仅','而且',
    '或者','另外','此外','同时','随后','接着','然后','于是','因此','总之','综上',
    '可见','显然','当然','确实','其实','究竟','到底','毕竟','终究','终于','依然',
    '仍然','依旧','照样','照常','照旧','一直','一向','从来','曾经','已经','正在',
    '将要','快要','即将','马上','立刻','顿时','随即','忽然','突然','猛然','骤然',
    '猝然','倏然','渐渐','逐渐','逐步','慢慢','缓缓','徐徐','悄悄','默默','轻轻',
    '微微','稍稍','略微','稍微','比较','较为','相对','十分','非常','特别','尤其',
    '格外','极其','万分','无比','相当','颇为','甚为','极为','最为','更加','越发',
    '愈来','越来越','一天天','一年年','一次次','一遍遍','一场场','一个个','一种种',
    '一份份','一片片','一段段','一句句','字里行间','言外之意','弦外之音','话里有话',
    '意味深长','不言而喻','显而易见','毋庸置疑','毫无疑问','确凿无疑','众所周知',
    '有目共睹','有据可查','有案可稽','证据确凿','村人日','张丘道'
  ]);

  const isValidChineseName = (name: string): boolean => {
    if (!name || name.length < 2 || name.length > 4) return false;
    if (blockedWords.has(name)) return false;

    const firstChar = name[0];
    if (commonSurnames.has(firstChar)) return true;

    for (const prefix of ['小','老','阿']) {
      if (name.startsWith(prefix) && name.length >= 2 && name.length <= 3) return true;
    }

    return false;
  };

  const strictPatterns = [
    /(?:^|\n|。|！|？)\s*([\u4e00-\u9fa5]{2,3})\s*[：:]\s*[""「「【【『『]/gm,
    /(?:^|\n|。|！|？)\s*([\u4e00-\u9fa5]{2,3})\s*[：:](?!\d)/gm,
    /(?:^|\n|。|！|？)\s*([\u4e00-\u9fa5]{2,3})\s*(?:说|道|问|答|喊|叫|笑|哭|怒|叹|哼)\s*[：:"]/gm,
  ];

  for (const pattern of strictPatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(originalText)) !== null) {
      const name = match[1].trim();
      if (isValidChineseName(name)) {
        nameMap.set(name, (nameMap.get(name) || 0) + 3);
      }
    }
  }

  const introPatterns = [
    /(?:主角|男主|女主|主人公|男主角|女主角|反派)(?:叫|名为|名叫|叫做|是)([\u4e00-\u9fa5]{2,4})/g,
    /(?:叫|名为|名叫|叫做|是)([\u4e00-\u9fa5]{2,4})(?:为主角|为男主|为女主|为反派)/g
  ];

  for (const pattern of introPatterns) {
    let match;
    while ((match = pattern.exec(originalText)) !== null) {
      const name = match[1]?.trim();
      if (name && isValidChineseName(name)) {
        nameMap.set(name, (nameMap.get(name) || 0) + 5);
      }
    }
  }

  const filteredNames: Array<{name: string, count: number}> = [];
  for (const [name, count] of nameMap.entries()) {
    if (count >= 2 && isValidChineseName(name)) {
      filteredNames.push({ name, count });
    }
  }

  filteredNames.sort((a, b) => b.count - a.count);

  for (const item of filteredNames.slice(0, 10)) {
    const name = item.name;
    const count = item.count;

    let role = '配角';
    if (count >= 6) role = '核心角色';
    else if (count >= 3) role = '主要角色';

    const contextIdx = originalText.indexOf(name);
    if (contextIdx > -1) {
      const context = originalText.substring(
        Math.max(0, contextIdx - 25),
        Math.min(originalText.length, contextIdx + name.length + 30)
      );
      if (/主角|男主|女主|主人公/.test(context)) role = '主角';
      else if (/反派|坏人|对手|敌人/.test(context)) role = '反派';
      else if (/朋友|伙伴|搭档/.test(context)) role = '配角-盟友';
    }

    characters.push({
      name,
      role,
      appearances: count,
      description: `在剧本中出现${count}次`
    });
  }

  return {
    list: characters,
    totalCount: characters.length,
    mainCharacters: characters.filter(c => c.appearances >= 3).length,
    hasClearProtagonist: characters.some(c => c.role === '主角' || c.role === '核心角色')
  };
}

function analyzeConflicts(originalText: string): any {
  const conflicts: Array<{type: string, description: string, intensity: string}> = [];
  
  const patterns = [
    { pattern: /(?:冲突|矛盾|对立|斗争|对抗)([^。', '！？\n]{10,60})/g, type: '外部冲突' },
    { pattern: /面临([^。', '！？\n]{15,50})(?:的挑战|的抉择|的考验|的困境|的危机)/g, type: '内心冲突' },
    { pattern: /必须([^。', '！？\n]{15,50})/g, type: '生存压力' },
    { pattern: /为了([^。', '！？\n]{10,40})(?:不惜|即使|哪怕|宁愿)/g, type: '道德困境' },
    { pattern: /([^。', '！？\n]{10,40})(?:与|和|同)([^。', '！？\n]{5,15})(?:发生|产生|引起)(?:冲突|矛盾|争执|分歧)/g, type: '人际冲突' }
  ];
  
  const seen = new Set<string>();
  
  for (const {pattern, type} of patterns) {
    let match;
    while ((match = pattern.exec(originalText)) !== null) {
      let desc = '';
      if (match.length === 2) desc = match[1].trim();
      else if (match.length === 3) desc = `${match[1]} 与 ${match[2]}`;
      else continue;
      
      if (desc && desc.length > 5 && desc.length < 80 && !seen.has(desc)) {
        seen.add(desc);
        
        const intenseWords = ['生死', '存亡', '毁灭', '终极', '必须', '不惜', '牺牲'];
        const isIntense = intenseWords.some(w => desc.includes(w));
        
        conflicts.push({
          type,
          description: desc,
          intensity: isIntense ? '高强度' : '中等强度'
        });
        
        if (conflicts.length >= 6) break;
      }
    }
    if (conflicts.length >= 6) break;
  }

  return {
    list: conflicts,
    totalCount: conflicts.length,
    hasCentralConflict: conflicts.some(c => c.type === '外部冲突' || c.type === '内心冲突'),
    quality: conflicts.length >= 3 ? '优秀' : conflicts.length >= 1 ? '一般' : '需加强'
  };
}

function extractSettings(originalText: string): any {
  const locations = new Set<string>();
  const times = new Set<string>();
  
  const locationPatterns = [
    /在([^。', '！？\n]{2,20})(?:中|里|内|上|下|间|旁|边|附近|周围)/g,
    /(?:来到|前往|到达|走进|进入|回到|跑向|走向)([^。', '！？\n]{2,20})/g,
    /(?:场景|地点|背景)[是在为][^。', '！？\n]{0,5}([^。', '！？\n]{2,20})/g
  ];
  
  const commonLocations = [
    '城市', '乡村', '学校', '办公室', '家', '医院', '餐厅', '街道', 
    '公园', '海边', '山上', '森林', '沙漠', '室内', '室外', '车内', 
    '机场', '酒店', '酒吧', '咖啡馆', '图书馆', '仓库', '工厂', '赌场',
    '房间', '卧室', '客厅', '厨房', '浴室', '阳台', '天台', '地下室'
  ];
  
  const timeWords = [
    '清晨', '上午', '中午', '下午', '傍晚', '深夜', '凌晨', '白天', '黑夜',
    '春天', '夏天', '秋天', '冬天', '春', '夏', '秋', '冬',
    '早晨', '黄昏', '午夜', '黎明', '傍晚', '夜晚', '深夜'
  ];
  
  for (const pattern of locationPatterns) {
    let match;
    while ((match = pattern.exec(originalText)) !== null) {
      const loc = match[1]?.trim();
      if (loc && loc.length >= 2 && loc.length <= 15 && !/^[0-9\s]+$/.test(loc)) {
        locations.add(loc);
      }
    }
  }
  
  for (const loc of commonLocations) {
    if (originalText.includes(loc)) locations.add(loc);
  }
  
  for (const time of timeWords) {
    if (originalText.includes(time)) times.add(time);
  }

  return {
    locations: Array.from(locations).slice(0, 10),
    times: Array.from(times).slice(0, 6),
    totalLocations: locations.size,
    diversity: locations.size >= 6 ? '丰富多样' : locations.size >= 3 ? '适中' : '单一'
  };
}

function analyzeToneAndRhythm(lowerText: string, originalText: string): any {
  // 统一的基调和节奏分析模块
  const moodIndicators: Record<string, string[]> = {
    positive: ['快乐', '幸福', '希望', '爱', '温暖', '光明', '成功', '胜利', '喜悦', '美好', '感动', '温馨', '开心', '满意'],
    negative: ['悲伤', '痛苦', '绝望', '黑暗', '恐惧', '愤怒', '死亡', '失败', '孤独', '失落', '绝望', '难过', '伤心'],
    suspense: ['神秘', '悬疑', '未知', '危险', '紧张', '恐怖', '诡异', '秘密', '谜团', '不安', '害怕'],
    romantic: ['浪漫', '温柔', '甜蜜', '心动', '深情', '眷恋', '思念', '喜欢', '爱恋', '暧昧'],
    epic: ['史诗', '宏大', '壮丽', '辉煌', '伟大', '传奇', '不朽', '震撼', '壮观']
  };

  const moodNameMap: Record<string, string> = {
    positive: '积极向上',
    negative: '压抑沉重',
    suspense: '悬疑紧张',
    romantic: '浪漫温馨',
    epic: '宏大史诗'
  };

  const scores: Record<string, number> = {};
  for (const [mood, words] of Object.entries(moodIndicators)) {
    scores[mood] = words.filter(word => lowerText.includes(word)).length;
  }
  
  const sortedMoods = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const dominantMood = sortedMoods[0] || ['neutral', 0];
  
  const fastIndicators = ['快速', '急促', '奔跑', '追逐', '战斗', '爆炸', '紧急', '突然', '冲刺', '飞奔', '立刻', '马上'];
  const slowIndicators = ['缓慢', '平静', '宁静', '沉思', '等待', '回忆', '悠长', '安静', '静谧', '缓缓', '慢慢'];
  
  const fastPace = fastIndicators.filter(w => lowerText.includes(w)).length;
  const slowPace = slowIndicators.filter(w => lowerText.includes(w)).length;
  
  let pace = '中等节奏';
  let paceDescription = '情节推进速度适中，张弛有度';
  if (fastPace > slowPace + 3) {
    pace = '快节奏';
    paceDescription = '情节推进迅速，充满紧张感和动感';
  } else if (slowPace > fastPace + 3) {
    pace = '慢节奏';
    paceDescription = '情节推进缓慢，注重氛围和细节描写';
  } else if (fastPace > slowPace + 1) {
    pace = '中快节奏';
    paceDescription = '情节推进偏快，有适当的节奏感';
  } else if (slowPace > fastPace + 1) {
    pace = '中慢节奏';
    paceDescription = '情节推进偏慢，有充分的铺垫和情感渲染';
  }
  
  const dominantMoodName = moodNameMap[dominantMood[0]] || '中性平和';
  const overallTone = `${dominantMoodName}的情感基调', '${pace}`;
  const themes = sortedMoods
    .filter(([, count]) => count > 0)
    .slice(0, 4)
    .map(([mood]) => moodNameMap[mood]);
  
  const themesStr = themes.length > 0 ? themes.slice(0, 3).join('、') : '多元情感';
  
  return {
    primaryMoodName: dominantMoodName,
    primaryMood: dominantMood[0],
    allMoodScores: scores,
    pace,
    paceDescription,
    overallTone,
    themes,
    analysisDetail: `剧本主要呈现"${dominantMoodName}"的情感基调', '${pace}推进。情感元素包括${themesStr}等。`
  };
}

function analyzeStructure(originalText: string): any {
  const paragraphs = originalText.split(/\n\n+/).filter(p => p.trim());
  const total = paragraphs.length;
  
  let structureType = '片段';
  let completeness = '雏形';
  
  if (total >= 30) { structureType = '完整三幕式'; completeness = '完整'; }
  else if (total >= 18) { structureType = '标准三幕式'; completeness = '完整'; }
  else if (total >= 12) { structureType = '简化三幕式'; completeness = '基本完整'; }
  else if (total >= 6) { structureType = '短篇结构'; completeness = '片段'; }
  else if (total >= 3) { structureType = '场景/片段'; completeness = '雏形'; }

  return {
    type: structureType,
    completeness,
    totalSections: total,
    suggestion: total < 12 ? '建议扩展剧本内容，完善故事结构，至少包含建置、对抗、解决三个基本部分' : null
  };
}

function analyzeDialogue(originalText: string): any {
  const dialoguePattern = /[""「「]'([^'""]{1,200})['"」」]/g;
  const dialogues: string[] = [];
  let match;
  
  while ((match = dialoguePattern.exec(originalText)) !== null) {
    if (match[1]) dialogues.push(match[1]);
  }

  const total = dialogues.length;
  const avgLen = total > 0 ? Math.round(dialogues.reduce((sum, d) => sum + d.length, 0) / total) : 0;
  
  let qualityLevel = '需加强';
  if (total >= 15) qualityLevel = '优秀';
  else if (total >= 8) qualityLevel = '良好';
  else if (total >= 3) qualityLevel = '一般';

  return {
    totalDialogues: total,
    averageLength: avgLen > 0 ? `${avgLen} 字` : '-',
    qualityLevel,
    suggestion: total < 3 ? '建议增加角色对白，通过对话推动情节发展和展现人物性格' : null
  };
}

function generateCreativeSuggestions(
  genreAnalysis: any,
  directorMatch: any,
  toneAnalysis: any,
  settingAnalysis: any,
  script: string
): Array<{category: string, title: string, content: string, detail: string}> {
  const suggestions: Array<{category: string, title: string, content: string, detail: string}> = [];
  const seenCategories = new Set<string>(); // 用于去重
  const topDirector = directorMatch?.topRecommendation;

  // 拍摄风格建议（最重要', '放在第一位）
  if (topDirector && !seenCategories.has('拍摄风格')) {
    seenCategories.add('拍摄风格');
    suggestions.push({
      category: '拍摄风格',
      title: `🎬 推荐采用 ${topDirector.name} 的拍摄手法`,
      content: topDirector.shootingStyle,
      detail: `基于剧本类型(${genreAnalysis.primaryGenre})和基调(${toneAnalysis.primaryMoodName || toneAnalysis.overallTone})分析', '与${topDirector.name}的风格匹配度${topDirector.suitability || 85}%。核心技法：${topDirector.techniques?.slice(0, 3).join('、') || '标志性视觉语言'}。`
    });
  }

  // 美术/视觉风格建议
  if (topDirector && !seenCategories.has('美术风格')) {
    seenCategories.add('美术风格');
    suggestions.push({
      category: '美术风格',
      title: `🎨 ${topDirector.name} 式视觉设计方案`,
      content: topDirector.artStyle,
      detail: `结合场景设置${settingAnalysis.locations?.slice(0, 2).join('、') || '待提取'}', '在色彩方案、场景设计、道具美学上参考此风格。`
    });
  }

  // 分镜设计建议
  if (topDirector && !seenCategories.has('分镜设计')) {
    seenCategories.add('分镜设计');
    suggestions.push({
      category: '分镜设计',
      title: `📐 ${topDirector.name} 式镜头语言`,
      content: topDirector.storyboardStyle,
      detail: `针对${toneAnalysis.pace || '中等'}节奏的剧本', '在镜头运动、构图规划、时空关系上采用此分镜理念。`
    });
  }

  // 如果没有导演匹配', '提供通用类型建议
  if (!topDirector && !seenCategories.has('拍摄风格')) {
    const genreShootingMap: Record<string, string> = {
      '科幻': '冷色调照明 + 广角展现空间感 + 特效预演(Previs) + LED虚拟拍摄墙增强沉浸感',
      '悬疑': '低角度照明制造阴影 + 特写捕捉微表情 + 长镜头营造紧张感 + 声音设计配合节奏',
      '动作': '高速摄影(120fps+) + 稳定器长镜头一镜到底 + 广角展现场面 + 快速剪辑控制节奏',
      '爱情': '柔光浅景深突出主体 + 温暖色调浪漫氛围 + 手持轻微晃动增加亲密感 + 自然光质感',
      '惊悚': '高对比明暗设计 + 非常规角度不安感 + 限制性视角未知恐惧 + 声音先于画面预期',
      '剧情': '自然光效真实质感 + 中景镜头捕捉情感 + 缓慢推进营造氛围 + 细节特写传递情绪'
    };

    const shootingAdvice = genreShootingMap[genreAnalysis.primaryGenre] || genreShootingMap['剧情'];
    seenCategories.add('拍摄风格');
    suggestions.push({
      category: '拍摄风格',
      title: `🎬 ${genreAnalysis.primaryGenre}类型专业拍摄建议`,
      content: shootingAdvice,
      detail: `基于${genreAnalysis.primaryGenre}类型的叙事需求', '结合${toneAnalysis.pace || '标准'}节奏特点', '采用上述专业拍摄手法。`
    });
  }

  // 确保至少有3个建议（如果不够', '补充通用建议）
  if (suggestions.length < 3) {
    if (!seenCategories.has('色彩运用')) {
      seenCategories.add('色彩运用');
      suggestions.push({
        category: '色彩运用',
        title: '🌈 色彩情绪设计方案',
        content: `根据${toneAnalysis.primaryMoodName || toneAnalysis.overallTone || '剧本基调'}的情感走向，建立统一的色彩情绪板。主色调应服务于叙事主题，辅助色用于区分时空或角色心理状态。`,
        detail: '参考影片的色彩分级案例，建立从前期拍摄到后期调色的完整色彩管理体系。'
      });
    }
  }

  return suggestions.slice(0, 5); // 最多返回5条建议
}

function generateImprovementSuggestions(
  genreAnalysis: any, 
  directorMatch: any, 
  conflictAnalysis: any, 
  dialogueAnalysis: any, 
  structureAnalysis: any,
  toneAnalysis: any,
  characterAnalysis: any,
  script: string
): string[] {
  const suggestions: string[] = [];

  // 基于导演的建议
  if (directorMatch?.topRecommendation) {
    suggestions.push(`推荐深入研究 ${directorMatch.topRecommendation.name} 的创作方法论', '特别是其${directorMatch.topRecommendation.style?.slice(0, 2).join('、')}等核心理念`);
  }

  // 基于冲突分析
  if (conflictAnalysis.totalCount === 0) {
    suggestions.push('当前剧本缺乏明确的戏剧冲突', '建议为核心角色设定一个具体目标和一个阻碍目标实现的障碍', '形成基本的戏剧张力');
  } else if (conflictAnalysis.totalCount === 1) {
    suggestions.push('目前只有单一冲突线', '建议增加次要冲突或内心冲突层次', '使故事更具立体感');
  }

  // 基于对话分析
  if (dialogueAnalysis.totalDialogues < 3) {
    suggestions.push('剧本对白较少', '建议增加角色间的互动对话', '通过对话展现人物性格和推动情节发展');
  } else if (dialogueAnalysis.qualityLevel === '需加强') {
    suggestions.push('对白质量有待提升', '建议让每句对白都服务于角色塑造或情节推进', '避免功能性对话');
  }

  // 基于结构分析
  if (structureAnalysis.suggestion) {
    suggestions.push(structureAnalysis.suggestion);
  }

  // 基于角色分析
  if (!characterAnalysis.hasClearProtagonist && characterAnalysis.totalCount > 0) {
    suggestions.push('有多个角色但缺乏明确的主角定位', '建议确定一个核心视角角色', '让观众有明确的情感投射对象');
  } else if (characterAnalysis.totalCount === 0) {
    suggestions.push('尚未识别出明确角色', '建议创建至少一个有明确动机和成长弧线的核心角色');
  }

  // 基于基调分析
  if (toneAnalysis.themes?.length === 0) {
    suggestions.push('剧本的主题表达尚不清晰', '建议明确故事想要探讨的核心命题', '使作品有更深层的思想内涵');
  }

  // 基于类型
  if (genreAnalysis.confidence === '低') {
    suggestions.push(`当前剧本的${genreAnalysis.primaryGenre}类型特征不够明显', '建议强化该类型的标志性元素', '使观众更容易理解和投入`);
  }

  // 通用建议
  suggestions.push('建议加入更多感官描写（视觉、听觉、触觉、嗅觉等）增强读者的沉浸体验');
  suggestions.push('确保每个关键场景都有明确的目的：要么推动情节', '要么揭示人物', '要么建立世界观');

  return suggestions.slice(0, 8);
}

function generateStoryboardSuggestions(
  script: string, 
  directorMatch: any, 
  genreAnalysis: any
): Array<{scene: string, shotType: string, description: string, cameraMovement: string, note: string}> {
  const suggestions: Array<{scene: string, shotType: string, description: string, cameraMovement: string, note: string}> = [];
  
  const paragraphs = script.split(/\n\n+/).filter(p => p.trim());
  const shotTypes = ['特写', '近景', '中景', '全景', '远景', '大远景'];
  const movements = ['固定', '缓慢推进', '横移', '环绕', '升降', '跟拍', '手持晃动', '快速推拉'];

  for (let i = 0; i < Math.min(paragraphs.length, 10); i++) {
    const para = paragraphs[i].trim();
    if (para.length < 5) continue;

    let shotType = '中景';
    let movement = '缓慢推进';
    
    // 根据内容智能判断镜头类型
    if (/(走|跑|追|逃|冲|赶|奔)/.test(para)) { shotType = '全景'; movement = '跟拍'; }
    else if (/(看|望|注视|凝视|盯着|观察)/.test(para)) { shotType = '特写'; movement = '缓慢推进'; }
    else if (/(城市|天空|大海|山|森林|沙漠| crowd |人群|军队)/.test(para)) { shotType = '大远景'; movement = '升降'; }
    else if (/(说|问|喊|叫|道|回答|回应)/.test(para)) { shotType = '近景'; movement = '固定'; }
    else if (/(想|思考|回忆|梦见|感觉|觉得|意识到)/.test(para)) { shotType = '特写'; movement = '固定'; }
    else if (/(打|斗|杀|砍|刺|射击|开枪)/.test(para)) { shotType = '中景'; movement = '手持晃动'; }

    // 根据导演风格调整
    if (directorMatch?.topRecommendation) {
      const dirName = directorMatch.topRecommendation.name;
      if (dirName.includes('诺兰') || dirName.includes('库布里克')) {
        movement = i % 2 === 0 ? '缓慢推进' : '固定';
      } else if (dirName.includes('王家卫')) {
        movement = '手持晃动';
      } else if (dirName.includes('维伦纽瓦')) {
        shotType = i === 0 ? '大远景' : shotType;
      }
    }

    suggestions.push({
      scene: `场景 ${i + 1}`,
      shotType,
      description: para.substring(0, 100) + (para.length > 100 ? '...' : ''),
      cameraMovement: movement,
      note: directorMatch?.topRecommendation 
        ? `参考${directorMatch.topRecommendation.name}风格` 
        : `基于${genreAnalysis.primaryGenre}类型`
    });
  }

  return suggestions;
}
