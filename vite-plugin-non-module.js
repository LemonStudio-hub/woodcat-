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

      // 不修改非模块化的script标签，保持原样
      // 这样Vite就不会尝试打包它们，它们会被保留在生成的HTML文件中
      const processedHtml = html;

      // 添加处理标记
      if (!processedHtml.includes(processMarker)) {
        return processedHtml.replace('</body>', `${processMarker}</body>`);
      }

      return processedHtml;
    }
  };
}