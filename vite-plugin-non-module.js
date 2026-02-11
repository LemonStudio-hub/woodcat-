/**
 * Vite插件：处理非模块化脚本
 * 在构建过程中自动为非模块化的script标签添加type="module"属性
 */

const processMarker = '<!-- [nonModulePlugin] Processed -->';

export function nonModulePlugin() {
  return {
    name: 'nonModulePlugin',
    enforce: 'pre',
    transformIndexHtml(html, { path }) {
      // 只处理HTML文件
      if (!path.endsWith('.html')) {
        return html;
      }

      // 检查是否已经处理过
      if (html.includes('[nonModulePlugin]') || html.includes(processMarker)) {
        return html;
      }

      // 替换所有非模块化的script标签，添加type="module"
      // 正则表达式匹配：script标签，包含src属性，可能包含其他属性
      const processedHtml = html.replace(
        /<script\s+([^>]*?)src\s*=\s*["']([^"']*)["']([^>]*?)>\s*<\/script>/gi,
        (match, beforeSrc, src, afterSrc) => {
          const allAttrs = (beforeSrc + afterSrc).trim();
          
          // 如果已经有type="module"，不修改
          if (allAttrs.includes('type="module"') || allAttrs.includes("type='module'")) {
            return match;
          }
          // 如果是外部CDN资源或data: URI，不添加module
          if (src.startsWith('http') || src.startsWith('//') || src.startsWith('data:')) {
            return match;
          }
          // 为本地资源添加module属性
          return `<script type="module" ${beforeSrc.trim()} src="${src}" ${afterSrc.trim()}></script>`;
        }
      );

      // 添加处理标记
      if (!processedHtml.includes(processMarker)) {
        return processedHtml.replace('</body>', `${processMarker}</body>`);
      }

      return processedHtml;
    }
  };
}