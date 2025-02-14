export function getBadgeEmoji(type: number): string {
  switch (type) {
    case 1: return '⭐'; // 明星贡献者
    case 2: return '🔥'; // 活跃开发者
    case 3: return '👑'; // 社区领袖
    case 4: return '💻'; // 代码大师
    case 5: return '📈'; // 热门项目
    case 6: return '🔮'; // 创新技术
    case 7: return '🏆'; // 社区之选
    case 8: return '🌟'; // 高影响力
    default: return '🏅';
  }
}

export function generateBadgeSVG(badgeType: number, name: string): string {
  const color = getBadgeColor(badgeType);
  const emoji = getBadgeEmoji(badgeType);
  
  return `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 渐变定义 -->
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
        </linearGradient>
        
        <!-- 像素边框滤镜 -->
        <filter id="pixelate" x="-10%" y="-10%" width="120%" height="120%">
          <feFlood flood-color="${color}" result="color"/>
          <feMorphology operator="dilate" radius="4" in="SourceAlpha" result="pixels"/>
          <feComposite operator="in" in="color" in2="pixels" result="pixelBorder"/>
        </filter>

        <!-- 阴影效果 -->
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="10" flood-opacity="0.2"/>
        </filter>
      </defs>

      <!-- 背景 -->
      <rect width="100%" height="100%" fill="url(#bgGradient)"/>
      
      <!-- 像素化边框 -->
      <g filter="url(#shadow)">
        <path d="M50,200 L100,100 L300,100 L350,200 L300,300 L100,300 Z" 
              fill="none" 
              stroke="${color}" 
              stroke-width="15"
              stroke-linejoin="miter"
              filter="url(#pixelate)"/>
      </g>

      <!-- 中心图标 -->
      <text x="200" 
            y="180" 
            font-size="120" 
            text-anchor="middle" 
            dominant-baseline="middle"
            filter="url(#shadow)"
      >${emoji}</text>

      <!-- 徽章名称 -->
      <g transform="translate(200,320)">
        <rect x="-120" 
              y="-25" 
              width="240" 
              height="50" 
              fill="${color}" 
              rx="8"
              filter="url(#shadow)"/>
        <text x="0" 
              y="8" 
              font-size="24" 
              text-anchor="middle" 
              fill="white" 
              font-family="monospace"
              font-weight="bold"
        >${name}</text>
      </g>
    </svg>
  `;
}

function getBadgeColor(type: number): string {
  switch (type) {
    case 1: return '#FFD700'; // 金色
    case 2: return '#FF6B4A'; // 亮红色
    case 3: return '#9B4DCA'; // 亮紫色
    case 4: return '#4A9EFF'; // 亮蓝色
    case 5: return '#FF4D94'; // 粉色
    case 6: return '#00C4A7'; // 青色
    case 7: return '#FFB302'; // 橙色
    case 8: return '#985EFF'; // 紫色
    default: return '#808080';
  }
}