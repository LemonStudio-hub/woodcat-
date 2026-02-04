/**
 * Vite插件：处理非模块化脚本
 * 在构建过程中自动为非模块化的script标签添加type="module"属性
 */

export function nonModulePlugin() {
  return {
    name: 'nonModulePlugin',
    transformIndexHtml(html, { path }) {
      // 只处理HTML文件
      if (!path.endsWith('.html')) {
        return html;
      }

      // 检查是否已经处理过
      if (html.includes('[nonModulePlugin]')) {
        return html;
      }

      // 记录处理开始
      const processMarker = `<!-- [nonModulePlugin] Processed -->`;
      if (html.includes(processMarker)) {
        return html;
      }

      // 替换所有script标签，添加type="module"
      const processedHtml = html.replace(
        /<script\s+src\s*=\s*["']([^"']*)["'][^>]*><\/script>/gi,
        (match, src) => {
          // 如果已经有type="module"，不修改
          if (match.includes('type="module"') || match.includes("type='module'")) {
            return match;
          }
          // 如果是外部CDN资源，不添加module
          if (src.startsWith('http') || src.startsWith('//')) {
            return match;
          }
          // 为本地资源添加module属性
          return `<script type="module" src="${src}"></script>`;
        }
      );

      return processedHtml;
    },
    generateBundle(options, bundle) {
      // 在生成bundle后处理HTML文件
      for (const [fileName, fileInfo] of Object.entries(bundle)) {
        if (fileInfo.type === 'asset' && fileName.endsWith('.html')) {
          let content = fileInfo.source;
          
          // 添加处理标记
          if (!content.includes(processMarker)) {
            content = content.replace('</body>', `${processMarker}</body>`);
          }
          
          fileInfo.source = content;
        }
      }
    }
  };
}

const processMarker = '<!-- [nonModulePlugin] Processed -->';